import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'
import * as paginate from 'mongoose-paginate-v2'
import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { OrderStatus, TransactionStatus, UserRole } from '@common/contracts/constant'
import { IsEmail, IsNotEmpty, IsPhoneNumber, MaxLength, ValidateNested } from 'class-validator'
import { Payment } from '@payment/schemas/payment.schema'

export class CustomerOrderDto {
  _id?: string

  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(30)
  firstName: string

  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(30)
  lastName: string

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string

  @ApiProperty()
  @IsNotEmpty()
  @IsPhoneNumber('VN')
  phone: string

  @ApiProperty()
  @IsNotEmpty()
  shippingAddress: string
}

export class OrderHistoryDto {
  constructor(orderStatus: OrderStatus, transactionStatus: TransactionStatus, userId: string, userRole: UserRole) {
    this.orderStatus = orderStatus
    this.transactionStatus = transactionStatus
    this.timestamp = new Date()
    this.userId = userId
    this.userRole = userRole
  }

  @ApiProperty()
  orderStatus: OrderStatus

  @ApiProperty()
  transactionStatus: TransactionStatus

  @ApiProperty()
  timestamp: Date

  @ApiProperty()
  userId: string

  @ApiProperty()
  userRole: UserRole
}

export class OrderItemDto {
  @Prop({ type: Types.ObjectId, ref: 'Course' })
  course: string

  @Prop({ type: Number, required: true })
  price: number
}

export type OrderDocument = HydratedDocument<Order>

@Schema({
  collection: 'orders',
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      delete ret.__v
    }
  }
})
export class Order {
  constructor(id?: string) {
    this._id = id
  }

  @ApiProperty()
  @Transform(({ value }) => value?.toString())
  _id: string

  @ApiProperty()
  @Prop({ type: String })
  orderNumber: string
  
  @Prop({
    type: Types.ObjectId,
    ref: 'Customer'
  })
  customer: string

  @Prop({ type: Array<OrderItemDto>, required: true })
  items: OrderItemDto[]

  @Prop({ type: Number, required: true })
  totalAmount: number

  @Prop({ type: Date, required: true, default: new Date() })
  orderDate: Date

  @Prop({
    enum: OrderStatus,
    default: OrderStatus.PENDING
  })
  orderStatus: OrderStatus

  @Prop({
    enum: TransactionStatus,
    default: TransactionStatus.DRAFT
  })
  transactionStatus: TransactionStatus

  @ApiProperty()
  @Prop({ type: Payment })
  payment: Payment
}

export const OrderSchema = SchemaFactory.createForClass(Order)
OrderSchema.plugin(paginate)
