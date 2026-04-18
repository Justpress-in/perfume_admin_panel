import PropTypes from 'prop-types';
import { Box } from '@mui/material';

export const LOGO_URL = '/images/perfume.png';

export const Logo = ({ size = 28 }) => (
  <Box
    component="img"
    src={LOGO_URL}
    alt="Oud Al-Anood"
    sx={{
      height: size,
      width: 'auto',
      maxWidth: '100%',
      objectFit: 'contain',
      display: 'block'
    }}
  />
);

Logo.propTypes = {
  size: PropTypes.number
};
