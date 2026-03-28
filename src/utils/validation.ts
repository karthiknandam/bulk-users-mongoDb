import z from "zod";

export const userSchemaValidation = z.object({
  fullName: z.string({ error: "name is required" }).min(3),
  email: z.email({ error: "Invalid Email format" }),
  phone: z.string({ error: "Invalid phone number" }).regex(/^\+91[6-9]\d{9}$/),

  walletBalace: z.number({ error: "must be >=0" }).default(0).optional(),

  isBlocked: z
    .boolean({ error: "Must be a boolean" })
    .default(false)
    .optional(),

  kycStatus: z
    .enum(["Pending", "Approved", "Rejected"])
    .default("Pending")
    .optional(),

  deviceInfo: z.object({
    ipAddress: z.string({ error: "IpAddress not found" }),
    deviceType: z.string({ error: "DeviceType not found" }),
    os: z.string({ error: "OS not found" }),
  }),
});

export const userUpdateSchemaValidation = z
  .object({
    fullName: z.string({ error: "name is required" }).min(3).optional(),
    email: z.email({ error: "Invalid Email format" }).optional(),
    phone: z
      .string({ error: "Invalid phone number" })
      .regex(/^\+91[6-9]\d{9}$/)
      .optional(),

    walletBalace: z.number({ error: "must be >=0" }).default(0).optional(),

    isBlocked: z
      .boolean({ error: "Must be a boolean" })
      .default(false)
      .optional(),

    kycStatus: z
      .enum(["Pending", "Approved", "Rejected"])
      .default("Pending")
      .optional(),

    deviceInfo: z
      .object({
        ipAddress: z.string({ error: "IpAddress not found" }).optional(),
        deviceType: z.string({ error: "DeviceType not found" }).optional(),
        os: z.string({ error: "OS not found" }).optional(),
      })
      .optional(),
  })
  .refine((data) => data.email !== undefined || data.phone !== undefined, {
    message: "Either email or phone is required to identify the user",
  });

export type userSchemaType = z.infer<typeof userSchemaValidation>;
export type updateSchemaType = z.infer<typeof userUpdateSchemaValidation>;
