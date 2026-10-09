import PropTypes from 'prop-types';
import { Chip } from '@mui/material';

const PAYMENT_STATUS = {
  paid:     { label: 'Paid', color: 'success' },
  pending:  { label: 'Awaiting payment', color: 'warning' },
  failed:   { label: 'Payment failed', color: 'error' },
  refunded: { label: 'Refunded', color: 'default' },
};

// Online payment status for an order. Orders placed without online payment show nothing.
export const PaymentChip = ({ payment, size = 'small' }) => {
  if (!payment || payment.method !== 'paypal') return null;
  const info = PAYMENT_STATUS[payment.status] || { label: payment.status, color: 'default' };
  return <Chip label={info.label} color={info.color} size={size} variant="outlined" sx={{ fontSize: 11 }} />;
};

PaymentChip.propTypes = {
  payment: PropTypes.object,
  size: PropTypes.string,
};
