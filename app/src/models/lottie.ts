export type Lottie = {
  version: "0.1.0";
  name: "lottie";
  instructions: [
    {
      name: "createPool";
      accounts: [
        {
          name: "signer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "poolConfig";
          isMut: true;
          isSigner: false;
          docs: ["Pool Config account stores allowlisted mints."];
        },
        {
          name: "lotteryPool";
          isMut: true;
          isSigner: false;
          docs: ["Lottery Pool account stores pool metadata."];
        },
        {
          name: "stakeToken";
          isMut: true;
          isSigner: false;
          docs: ["Stake Token account holds token deposits."];
        },
        {
          name: "ticketMint";
          isMut: true;
          isSigner: false;
          docs: ["Ticket Mint account represents stake receipts."];
        },
        {
          name: "ticketMintMetadata";
          isMut: true;
          isSigner: false;
        },
        {
          name: "mint";
          isMut: false;
          isSigner: false;
          docs: ["Mint account is the stakeable token."];
        },
        {
          name: "switchboardAggregator";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenMetadataProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "startTime";
          type: "i64";
        },
        {
          name: "endTime";
          type: "i64";
        },
        {
          name: "tokenName";
          type: "string";
        }
      ];
    },
    {
      name: "stake";
      accounts: [
        {
          name: "signer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "lotteryPool";
          isMut: true;
          isSigner: false;
          docs: ["Lottery Pool account stores pool metadata."];
        },
        {
          name: "stakeToken";
          isMut: true;
          isSigner: false;
          docs: ["Stake Token account holds token deposits."];
        },
        {
          name: "userToken";
          isMut: true;
          isSigner: false;
          docs: ["User Token account is used to transfer tokens from."];
        },
        {
          name: "userTicket";
          isMut: true;
          isSigner: false;
          docs: ["User Ticket account is used to transfer tickets to."];
        },
        {
          name: "ticketMint";
          isMut: true;
          isSigner: false;
          docs: ["Ticket Mint account represents stake receipts."];
        },
        {
          name: "mint";
          isMut: false;
          isSigner: false;
          docs: ["Mint account is the stakeable token."];
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "associatedTokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "amount";
          type: "u64";
        }
      ];
    },
    {
      name: "start";
      accounts: [
        {
          name: "signer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "lotteryPool";
          isMut: true;
          isSigner: false;
          docs: ["Lottery Pool account stores pool metadata."];
        },
        {
          name: "mint";
          isMut: false;
          isSigner: false;
          docs: ["Mint account is the stakeable token."];
        },
        {
          name: "switchboardAggregator";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "settle";
      accounts: [
        {
          name: "signer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "lotteryPool";
          isMut: true;
          isSigner: false;
          docs: ["Lottery Pool account stores pool metadata."];
        },
        {
          name: "mint";
          isMut: false;
          isSigner: false;
          docs: ["Mint account is the stakeable token."];
        },
        {
          name: "switchboardAggregator";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "unstake";
      accounts: [
        {
          name: "signer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "lotteryPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "stakeToken";
          isMut: true;
          isSigner: false;
        },
        {
          name: "userToken";
          isMut: true;
          isSigner: false;
        },
        {
          name: "userTicket";
          isMut: true;
          isSigner: false;
        },
        {
          name: "ticketMint";
          isMut: true;
          isSigner: false;
        },
        {
          name: "mint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "associatedTokenProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    }
  ];
  accounts: [
    {
      name: "lotteryPool";
      type: {
        kind: "struct";
        fields: [
          {
            name: "mint";
            type: "publicKey";
          },
          {
            name: "startTime";
            type: "i64";
          },
          {
            name: "endTime";
            type: "i64";
          },
          {
            name: "startedAt";
            type: {
              option: "i64";
            };
          },
          {
            name: "settledAt";
            type: {
              option: "i64";
            };
          },
          {
            name: "startRate";
            type: {
              option: "u64";
            };
          },
          {
            name: "endRate";
            type: {
              option: "u64";
            };
          },
          {
            name: "holders";
            type: {
              vec: "publicKey";
            };
          },
          {
            name: "amounts";
            type: {
              vec: "u64";
            };
          },
          {
            name: "supply";
            type: "u64";
          },
          {
            name: "winner";
            type: {
              option: "publicKey";
            };
          },
          {
            name: "bump";
            type: "u8";
          },
          {
            name: "switchboardAggregator";
            type: "publicKey";
          }
        ];
      };
    },
    {
      name: "poolConfig";
      type: {
        kind: "struct";
        fields: [
          {
            name: "assets";
            type: {
              vec: "publicKey";
            };
          },
          {
            name: "bump";
            type: "u8";
          }
        ];
      };
    }
  ];
  types: [
    {
      name: "FeedErrorCode";
      type: {
        kind: "enum";
        variants: [
          {
            name: "StaleFeed";
          }
        ];
      };
    }
  ];
  errors: [
    {
      code: 6000;
      name: "InvalidAssetKey";
      msg: "An invalid asset mint address was provided";
    },
    {
      code: 6001;
      name: "InvalidTimestamp";
      msg: "The timestamp is not at a future point in time";
    },
    {
      code: 6002;
      name: "AmountNotEnough";
      msg: "The amount proposed to stake is not great enough for at least 1 ticket";
    },
    {
      code: 6003;
      name: "PastStakePeriod";
      msg: "The lottery pool stake period has ended";
    },
    {
      code: 6004;
      name: "BeforeUnstakePeriod";
      msg: "The lottery pool unstake period has not started";
    },
    {
      code: 6005;
      name: "BeforeStartPeriod";
      msg: "The lottery pool start period has not started";
    },
    {
      code: 6006;
      name: "PastStartPeriod";
      msg: "The lottery pool start period has ended";
    },
    {
      code: 6007;
      name: "BeforeSettlePeriod";
      msg: "The lottery pool settle period has not started";
    },
    {
      code: 6008;
      name: "AlreadyStarted";
      msg: "The lottery pool has already been started";
    },
    {
      code: 6009;
      name: "AlreadySettled";
      msg: "The lottery pool has already been settled";
    },
    {
      code: 6010;
      name: "AlreadyRedeemed";
      msg: "The lottery pool tickets have already been redeemed";
    }
  ];
};

export const IDL: Lottie = {
  version: "0.1.0",
  name: "lottie",
  instructions: [
    {
      name: "createPool",
      accounts: [
        {
          name: "signer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "poolConfig",
          isMut: true,
          isSigner: false,
          docs: ["Pool Config account stores allowlisted mints."],
        },
        {
          name: "lotteryPool",
          isMut: true,
          isSigner: false,
          docs: ["Lottery Pool account stores pool metadata."],
        },
        {
          name: "stakeToken",
          isMut: true,
          isSigner: false,
          docs: ["Stake Token account holds token deposits."],
        },
        {
          name: "ticketMint",
          isMut: true,
          isSigner: false,
          docs: ["Ticket Mint account represents stake receipts."],
        },
        {
          name: "ticketMintMetadata",
          isMut: true,
          isSigner: false,
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
          docs: ["Mint account is the stakeable token."],
        },
        {
          name: "switchboardAggregator",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenMetadataProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "startTime",
          type: "i64",
        },
        {
          name: "endTime",
          type: "i64",
        },
        {
          name: "tokenName",
          type: "string",
        },
      ],
    },
    {
      name: "stake",
      accounts: [
        {
          name: "signer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "lotteryPool",
          isMut: true,
          isSigner: false,
          docs: ["Lottery Pool account stores pool metadata."],
        },
        {
          name: "stakeToken",
          isMut: true,
          isSigner: false,
          docs: ["Stake Token account holds token deposits."],
        },
        {
          name: "userToken",
          isMut: true,
          isSigner: false,
          docs: ["User Token account is used to transfer tokens from."],
        },
        {
          name: "userTicket",
          isMut: true,
          isSigner: false,
          docs: ["User Ticket account is used to transfer tickets to."],
        },
        {
          name: "ticketMint",
          isMut: true,
          isSigner: false,
          docs: ["Ticket Mint account represents stake receipts."],
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
          docs: ["Mint account is the stakeable token."],
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "associatedTokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "amount",
          type: "u64",
        },
      ],
    },
    {
      name: "start",
      accounts: [
        {
          name: "signer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "lotteryPool",
          isMut: true,
          isSigner: false,
          docs: ["Lottery Pool account stores pool metadata."],
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
          docs: ["Mint account is the stakeable token."],
        },
        {
          name: "switchboardAggregator",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "settle",
      accounts: [
        {
          name: "signer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "lotteryPool",
          isMut: true,
          isSigner: false,
          docs: ["Lottery Pool account stores pool metadata."],
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
          docs: ["Mint account is the stakeable token."],
        },
        {
          name: "switchboardAggregator",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "unstake",
      accounts: [
        {
          name: "signer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "lotteryPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "stakeToken",
          isMut: true,
          isSigner: false,
        },
        {
          name: "userToken",
          isMut: true,
          isSigner: false,
        },
        {
          name: "userTicket",
          isMut: true,
          isSigner: false,
        },
        {
          name: "ticketMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "associatedTokenProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: "lotteryPool",
      type: {
        kind: "struct",
        fields: [
          {
            name: "mint",
            type: "publicKey",
          },
          {
            name: "startTime",
            type: "i64",
          },
          {
            name: "endTime",
            type: "i64",
          },
          {
            name: "startedAt",
            type: {
              option: "i64",
            },
          },
          {
            name: "settledAt",
            type: {
              option: "i64",
            },
          },
          {
            name: "startRate",
            type: {
              option: "u64",
            },
          },
          {
            name: "endRate",
            type: {
              option: "u64",
            },
          },
          {
            name: "holders",
            type: {
              vec: "publicKey",
            },
          },
          {
            name: "amounts",
            type: {
              vec: "u64",
            },
          },
          {
            name: "supply",
            type: "u64",
          },
          {
            name: "winner",
            type: {
              option: "publicKey",
            },
          },
          {
            name: "bump",
            type: "u8",
          },
          {
            name: "switchboardAggregator",
            type: "publicKey",
          },
        ],
      },
    },
    {
      name: "poolConfig",
      type: {
        kind: "struct",
        fields: [
          {
            name: "assets",
            type: {
              vec: "publicKey",
            },
          },
          {
            name: "bump",
            type: "u8",
          },
        ],
      },
    },
  ],
  types: [
    {
      name: "FeedErrorCode",
      type: {
        kind: "enum",
        variants: [
          {
            name: "StaleFeed",
          },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: "InvalidAssetKey",
      msg: "An invalid asset mint address was provided",
    },
    {
      code: 6001,
      name: "InvalidTimestamp",
      msg: "The timestamp is not at a future point in time",
    },
    {
      code: 6002,
      name: "AmountNotEnough",
      msg: "The amount proposed to stake is not great enough for at least 1 ticket",
    },
    {
      code: 6003,
      name: "PastStakePeriod",
      msg: "The lottery pool stake period has ended",
    },
    {
      code: 6004,
      name: "BeforeUnstakePeriod",
      msg: "The lottery pool unstake period has not started",
    },
    {
      code: 6005,
      name: "BeforeStartPeriod",
      msg: "The lottery pool start period has not started",
    },
    {
      code: 6006,
      name: "PastStartPeriod",
      msg: "The lottery pool start period has ended",
    },
    {
      code: 6007,
      name: "BeforeSettlePeriod",
      msg: "The lottery pool settle period has not started",
    },
    {
      code: 6008,
      name: "AlreadyStarted",
      msg: "The lottery pool has already been started",
    },
    {
      code: 6009,
      name: "AlreadySettled",
      msg: "The lottery pool has already been settled",
    },
    {
      code: 6010,
      name: "AlreadyRedeemed",
      msg: "The lottery pool tickets have already been redeemed",
    },
  ],
};
