import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'

type Register = z.infer<typeof registerSchema>

const registerSchema = z.object({
  email: z.email({ message: 'Please provide a valid email address.' }),
  password: z
    .string({ message: 'A password is required.' })
    .min(6, { message: 'Password must be at least 6 characters long.' })
    .max(24, { message: 'Password cannot exceed 24 characters.' }),
})

export const ExampleHookFormZodV4 = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Register>({
    resolver: zodResolver(registerSchema),
    reValidateMode: 'onSubmit',
  })

  const onSubmit = (data: Register) => {
    console.log(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
      <input {...register('email')} placeholder="Email" />
      {errors.email && <p>{errors.email.message}</p>}
      <input {...register('password')} placeholder="Password" />
      {errors.password && <p>{errors.password.message}</p>}
      <button type="submit">Register</button>
    </form>
  )
}
