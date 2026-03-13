import {
  DEFAULT_BATCH_COUNT,
  MAX_BATCH_COUNT,
  clampInt,
} from "./constants.js";

function buildDifficultyPlan(total, forcedLevel = null) {
  const count = clampInt(total, DEFAULT_BATCH_COUNT, 1, MAX_BATCH_COUNT);

  if ([1, 2, 3].includes(Number(forcedLevel))) {
    return Array.from({ length: count }, () => Number(forcedLevel));
  }

  if (count === 1) return [2];
  if (count === 2) return [1, 3];

  const plan = [];
  for (let index = 0; index < count; index += 1) {
    const level = 1 + Math.round((2 * index) / (count - 1));
    plan.push(level);
  }
  return plan;
}

function planLevelCounts(plan) {
  const counts = { 1: 0, 2: 0, 3: 0 };
  for (const level of plan) {
    const safe = Number(level);
    if ([1, 2, 3].includes(safe)) counts[safe] += 1;
  }
  return counts;
}

function toSafeQuotaCount(value, maxValue) {
  const parsed = Number.parseInt(String(value ?? "").trim(), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return Math.max(0, Math.min(maxValue, parsed));
}

function allocateWeightedCounts(remaining, levels, weightsByLevel) {
  const allocation = Object.fromEntries(levels.map((level) => [level, 0]));
  if (remaining <= 0 || !levels.length) return allocation;

  const normalizedWeights = levels.map((level) => {
    const value = Number(weightsByLevel?.[level] || 0);
    return Number.isFinite(value) && value > 0 ? value : 0;
  });
  const totalWeight = normalizedWeights.reduce((sum, value) => sum + value, 0);
  const safeTotalWeight = totalWeight > 0 ? totalWeight : levels.length;

  const remainders = [];
  let assigned = 0;
  for (let index = 0; index < levels.length; index += 1) {
    const level = levels[index];
    const weight = totalWeight > 0 ? normalizedWeights[index] : 1;
    const exact = (remaining * weight) / safeTotalWeight;
    const base = Math.floor(exact);
    allocation[level] = base;
    assigned += base;
    remainders.push({ level, frac: exact - base });
  }

  remainders.sort((left, right) => {
    if (right.frac !== left.frac) return right.frac - left.frac;
    return left.level - right.level;
  });

  let pointer = 0;
  while (assigned < remaining && remainders.length > 0) {
    const entry = remainders[pointer % remainders.length];
    allocation[entry.level] += 1;
    assigned += 1;
    pointer += 1;
  }

  return allocation;
}

function buildDifficultyPlanFromQuotas(total, quotas) {
  const count = clampInt(total, DEFAULT_BATCH_COUNT, 1, MAX_BATCH_COUNT);
  const cleaned = {
    1: toSafeQuotaCount(quotas?.[1], count),
    2: toSafeQuotaCount(quotas?.[2], count),
    3: toSafeQuotaCount(quotas?.[3], count),
  };

  let specifiedTotal = cleaned[1] + cleaned[2] + cleaned[3];
  if (specifiedTotal > count) {
    const scaled = { 1: 0, 2: 0, 3: 0 };
    const remainders = [];

    for (const level of [1, 2, 3]) {
      if (!cleaned[level]) continue;
      const exact = (cleaned[level] * count) / specifiedTotal;
      const base = Math.floor(exact);
      scaled[level] = base;
      remainders.push({ level, frac: exact - base, original: cleaned[level] });
    }

    let assigned = scaled[1] + scaled[2] + scaled[3];
    remainders.sort((left, right) => {
      if (right.frac !== left.frac) return right.frac - left.frac;
      if (right.original !== left.original) return right.original - left.original;
      return left.level - right.level;
    });

    let pointer = 0;
    while (assigned < count && remainders.length > 0) {
      const entry = remainders[pointer % remainders.length];
      scaled[entry.level] += 1;
      assigned += 1;
      pointer += 1;
    }

    cleaned[1] = scaled[1];
    cleaned[2] = scaled[2];
    cleaned[3] = scaled[3];
    specifiedTotal = count;
  }

  if (specifiedTotal < count) {
    const remaining = count - specifiedTotal;
    const defaultCounts = planLevelCounts(buildDifficultyPlan(count));
    const hasEasy = cleaned[1] > 0;
    const hasMedium = cleaned[2] > 0;
    const hasHard = cleaned[3] > 0;
    const unspecifiedLevels = [1, 2, 3].filter((level) => {
      if (level === 1) return !hasEasy;
      if (level === 2) return !hasMedium;
      return !hasHard;
    });
    const levelsToFill = unspecifiedLevels.length ? unspecifiedLevels : [2];
    const additional = allocateWeightedCounts(remaining, levelsToFill, defaultCounts);
    cleaned[1] += additional[1] || 0;
    cleaned[2] += additional[2] || 0;
    cleaned[3] += additional[3] || 0;
  }

  const plan = [];
  for (const level of [1, 2, 3]) {
    for (let index = 0; index < cleaned[level]; index += 1) {
      plan.push(level);
    }
  }

  if (plan.length < count) {
    while (plan.length < count) plan.push(2);
  } else if (plan.length > count) {
    plan.length = count;
  }

  return plan;
}

export function resolveDifficultyPlan(total, difficultySignals) {
  const count = clampInt(total, DEFAULT_BATCH_COUNT, 1, MAX_BATCH_COUNT);
  const forcedLevel = Number(difficultySignals?.forcedLevel);
  const quotas = difficultySignals?.quotas;
  const hasDifficultyHint = Boolean(difficultySignals?.hasDifficultyHint);

  if (quotas && Object.keys(quotas).length > 0) {
    return buildDifficultyPlanFromQuotas(count, quotas);
  }

  if ([1, 2, 3].includes(forcedLevel)) {
    return buildDifficultyPlan(count, forcedLevel);
  }

  if (hasDifficultyHint) return null;
  return buildDifficultyPlan(count);
}
