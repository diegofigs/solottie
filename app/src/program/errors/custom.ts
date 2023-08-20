export type CustomError =
  | InvalidAssetKey
  | InvalidTimestamp
  | AmountNotEnough
  | PastStakePeriod
  | BeforeUnstakePeriod
  | BeforeStartPeriod
  | PastStartPeriod
  | BeforeSettlePeriod
  | AlreadyStarted
  | AlreadySettled
  | AlreadyRedeemed;

export class InvalidAssetKey extends Error {
  static readonly code = 6000;
  readonly code = 6000;
  readonly name = "InvalidAssetKey";
  readonly msg = "An invalid asset mint address was provided";

  constructor(readonly logs?: string[]) {
    super("6000: An invalid asset mint address was provided");
  }
}

export class InvalidTimestamp extends Error {
  static readonly code = 6001;
  readonly code = 6001;
  readonly name = "InvalidTimestamp";
  readonly msg = "The timestamp is not at a future point in time";

  constructor(readonly logs?: string[]) {
    super("6001: The timestamp is not at a future point in time");
  }
}

export class AmountNotEnough extends Error {
  static readonly code = 6002;
  readonly code = 6002;
  readonly name = "AmountNotEnough";
  readonly msg =
    "The amount proposed to stake is not great enough for at least 1 ticket";

  constructor(readonly logs?: string[]) {
    super(
      "6002: The amount proposed to stake is not great enough for at least 1 ticket"
    );
  }
}

export class PastStakePeriod extends Error {
  static readonly code = 6003;
  readonly code = 6003;
  readonly name = "PastStakePeriod";
  readonly msg = "The lottery pool stake period has ended";

  constructor(readonly logs?: string[]) {
    super("6003: The lottery pool stake period has ended");
  }
}

export class BeforeUnstakePeriod extends Error {
  static readonly code = 6004;
  readonly code = 6004;
  readonly name = "BeforeUnstakePeriod";
  readonly msg = "The lottery pool unstake period has not started";

  constructor(readonly logs?: string[]) {
    super("6004: The lottery pool unstake period has not started");
  }
}

export class BeforeStartPeriod extends Error {
  static readonly code = 6005;
  readonly code = 6005;
  readonly name = "BeforeStartPeriod";
  readonly msg = "The lottery pool start period has not started";

  constructor(readonly logs?: string[]) {
    super("6005: The lottery pool start period has not started");
  }
}

export class PastStartPeriod extends Error {
  static readonly code = 6006;
  readonly code = 6006;
  readonly name = "PastStartPeriod";
  readonly msg = "The lottery pool start period has ended";

  constructor(readonly logs?: string[]) {
    super("6006: The lottery pool start period has ended");
  }
}

export class BeforeSettlePeriod extends Error {
  static readonly code = 6007;
  readonly code = 6007;
  readonly name = "BeforeSettlePeriod";
  readonly msg = "The lottery pool settle period has not started";

  constructor(readonly logs?: string[]) {
    super("6007: The lottery pool settle period has not started");
  }
}

export class AlreadyStarted extends Error {
  static readonly code = 6008;
  readonly code = 6008;
  readonly name = "AlreadyStarted";
  readonly msg = "The lottery pool has already been started";

  constructor(readonly logs?: string[]) {
    super("6008: The lottery pool has already been started");
  }
}

export class AlreadySettled extends Error {
  static readonly code = 6009;
  readonly code = 6009;
  readonly name = "AlreadySettled";
  readonly msg = "The lottery pool has already been settled";

  constructor(readonly logs?: string[]) {
    super("6009: The lottery pool has already been settled");
  }
}

export class AlreadyRedeemed extends Error {
  static readonly code = 6010;
  readonly code = 6010;
  readonly name = "AlreadyRedeemed";
  readonly msg = "The lottery pool tickets have already been redeemed";

  constructor(readonly logs?: string[]) {
    super("6010: The lottery pool tickets have already been redeemed");
  }
}

export function fromCode(code: number, logs?: string[]): CustomError | null {
  switch (code) {
    case 6000:
      return new InvalidAssetKey(logs);
    case 6001:
      return new InvalidTimestamp(logs);
    case 6002:
      return new AmountNotEnough(logs);
    case 6003:
      return new PastStakePeriod(logs);
    case 6004:
      return new BeforeUnstakePeriod(logs);
    case 6005:
      return new BeforeStartPeriod(logs);
    case 6006:
      return new PastStartPeriod(logs);
    case 6007:
      return new BeforeSettlePeriod(logs);
    case 6008:
      return new AlreadyStarted(logs);
    case 6009:
      return new AlreadySettled(logs);
    case 6010:
      return new AlreadyRedeemed(logs);
  }

  return null;
}
