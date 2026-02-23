const VALID_SIGNAL_STATUSES = new Set(["green", "amber", "red"]);

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function pushError(errors, path, message) {
  errors.push(`${path}: ${message}`);
}

function validateStringField(value, path, errors) {
  if (!isNonEmptyString(value)) {
    pushError(errors, path, "must be a non-empty string");
    return false;
  }
  return true;
}

function validateDataPoints(dataPoints, path, errors) {
  if (!Array.isArray(dataPoints)) {
    pushError(errors, path, "must be an array");
    return;
  }

  dataPoints.forEach((point, index) => {
    const pointPath = `${path}[${index}]`;
    if (!isPlainObject(point)) {
      pushError(errors, pointPath, "must be an object");
      return;
    }

    validateStringField(point.date, `${pointPath}.date`, errors);
    validateStringField(point.value, `${pointPath}.value`, errors);

    if (
      point.status !== undefined &&
      !VALID_SIGNAL_STATUSES.has(point.status)
    ) {
      pushError(
        errors,
        `${pointPath}.status`,
        "must be one of green, amber, red",
      );
    }
  });
}

function validateSignal(signal, path, errors) {
  if (!isPlainObject(signal)) {
    pushError(errors, path, "must be an object");
    return;
  }

  validateStringField(signal.name, `${path}.name`, errors);
  validateStringField(signal.source, `${path}.source`, errors);
  validateStringField(signal.frequency, `${path}.frequency`, errors);
  validateStringField(signal.baseline, `${path}.baseline`, errors);
  validateStringField(signal.threshold, `${path}.threshold`, errors);
  validateStringField(signal.notes, `${path}.notes`, errors);

  if (!VALID_SIGNAL_STATUSES.has(signal.currentStatus)) {
    pushError(
      errors,
      `${path}.currentStatus`,
      "must be one of green, amber, red",
    );
  }

  validateDataPoints(signal.dataPoints, `${path}.dataPoints`, errors);
}

function validateDomino(domino, index, errors, seenDominoIds) {
  const path = `dominos[${index}]`;
  if (!isPlainObject(domino)) {
    pushError(errors, path, "must be an object");
    return;
  }

  if (!Number.isInteger(domino.id) || domino.id <= 0) {
    pushError(errors, `${path}.id`, "must be a positive integer");
  } else if (seenDominoIds.has(domino.id)) {
    pushError(errors, `${path}.id`, `duplicate domino id ${domino.id}`);
  } else {
    seenDominoIds.add(domino.id);
  }

  validateStringField(domino.name, `${path}.name`, errors);
  validateStringField(domino.color, `${path}.color`, errors);
  validateStringField(domino.icon, `${path}.icon`, errors);
  validateStringField(domino.description, `${path}.description`, errors);

  if (!Array.isArray(domino.signals) || domino.signals.length === 0) {
    pushError(errors, `${path}.signals`, "must be a non-empty array");
  } else {
    const seenSignalNames = new Set();
    domino.signals.forEach((signal, signalIndex) => {
      validateSignal(signal, `${path}.signals[${signalIndex}]`, errors);
      if (isNonEmptyString(signal?.name)) {
        if (seenSignalNames.has(signal.name)) {
          pushError(
            errors,
            `${path}.signals[${signalIndex}].name`,
            `duplicate signal name "${signal.name}" within domino`,
          );
        } else {
          seenSignalNames.add(signal.name);
        }
      }
    });
  }

  if (!isPlainObject(domino.thresholds)) {
    pushError(errors, `${path}.thresholds`, "must be an object");
  } else if (Object.keys(domino.thresholds).length === 0) {
    pushError(errors, `${path}.thresholds`, "must include at least one key");
  } else if (Array.isArray(domino.signals)) {
    domino.signals.forEach((signal) => {
      if (isNonEmptyString(signal?.name) && !domino.thresholds[signal.name]) {
        pushError(
          errors,
          `${path}.thresholds`,
          `missing threshold entry for "${signal.name}"`,
        );
      }
    });
  }
}

function validateSource(source, index, errors) {
  const path = `sources[${index}]`;
  if (!isPlainObject(source)) {
    pushError(errors, path, "must be an object");
    return;
  }

  validateStringField(source.title, `${path}.title`, errors);
  validateStringField(source.author, `${path}.author`, errors);
  validateStringField(source.date, `${path}.date`, errors);
  validateStringField(source.url, `${path}.url`, errors);
  validateStringField(source.type, `${path}.type`, errors);
  validateStringField(source.color, `${path}.color`, errors);
}

function validatePortfolio(portfolio, errors) {
  if (!isPlainObject(portfolio)) {
    pushError(errors, "portfolio", "must be an object");
    return;
  }

  if (!Array.isArray(portfolio.legs) || portfolio.legs.length === 0) {
    pushError(errors, "portfolio.legs", "must be a non-empty array");
    return;
  }

  portfolio.legs.forEach((leg, index) => {
    const path = `portfolio.legs[${index}]`;
    if (!isPlainObject(leg)) {
      pushError(errors, path, "must be an object");
      return;
    }

    validateStringField(leg.leg, `${path}.leg`, errors);
    validateStringField(leg.thesis, `${path}.thesis`, errors);
    validateStringField(leg.color, `${path}.color`, errors);
    validateStringField(leg.notes, `${path}.notes`, errors);

    if (!Array.isArray(leg.tickers)) {
      pushError(errors, `${path}.tickers`, "must be an array");
    } else {
      leg.tickers.forEach((ticker, tickerIndex) => {
        validateStringField(ticker, `${path}.tickers[${tickerIndex}]`, errors);
      });
    }
  });
}

function validateCareerProfile(careerProfile, errors) {
  if (!isPlainObject(careerProfile)) {
    pushError(errors, "careerProfile", "must be an object");
    return;
  }

  validateStringField(careerProfile.currentRole, "careerProfile.currentRole", errors);
  validateStringField(careerProfile.targetRole, "careerProfile.targetRole", errors);
  validateStringField(careerProfile.industry, "careerProfile.industry", errors);
  validateStringField(careerProfile.experience, "careerProfile.experience", errors);

  if (!Array.isArray(careerProfile.goals) || careerProfile.goals.length === 0) {
    pushError(errors, "careerProfile.goals", "must be a non-empty array");
    return;
  }

  careerProfile.goals.forEach((goal, index) => {
    validateStringField(goal, `careerProfile.goals[${index}]`, errors);
  });
}

export function validateThesis(config) {
  const errors = [];

  if (!isPlainObject(config)) {
    return {
      valid: false,
      errors: ["config: must be an object"],
    };
  }

  if (!isPlainObject(config.meta)) {
    pushError(errors, "meta", "must be an object");
  } else {
    validateStringField(config.meta.name, "meta.name", errors);
    validateStringField(config.meta.author, "meta.author", errors);
    validateStringField(config.meta.version, "meta.version", errors);
  }

  if (!Array.isArray(config.dominos) || config.dominos.length === 0) {
    pushError(errors, "dominos", "must be a non-empty array");
  } else {
    const seenDominoIds = new Set();
    config.dominos.forEach((domino, index) => {
      validateDomino(domino, index, errors, seenDominoIds);
    });
  }

  if (!Array.isArray(config.sources) || config.sources.length === 0) {
    pushError(errors, "sources", "must be a non-empty array");
  } else {
    config.sources.forEach((source, index) => {
      validateSource(source, index, errors);
    });
  }

  validatePortfolio(config.portfolio, errors);
  validateCareerProfile(config.careerProfile, errors);

  return {
    valid: errors.length === 0,
    errors,
  };
}
