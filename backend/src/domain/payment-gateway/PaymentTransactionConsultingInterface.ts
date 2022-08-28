import { TransactionAttributes } from '../entities/Order';

export interface PaymentTransactionConsultingInterface {
  execute(notificationCode: string): Promise<TransactionConsultingOutput>;
}

export type TransactionConsultingOutput = TransactionAttributes & {
  id_order: string;
};
