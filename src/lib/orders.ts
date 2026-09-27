import type { Order } from '@/types'

export const ORDER_STATUS_LABEL: Record<Order['status'], string> = {
  pending: 'Aguardando pagamento',
  paid: 'Pago',
  processing: 'Em separação',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
}

/** Número do pedido com três dígitos, como o lote: 001. */
export function orderNumber(order: Pick<Order, 'number'>): string {
  return String(order.number ?? 0).padStart(3, '0')
}

export function itemCount(order: Pick<Order, 'items'>): number {
  return order.items.reduce((n, i) => n + i.quantity, 0)
}
