import React, { FunctionComponent } from 'react';
import { useTheme } from '@mui/material';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

const SpacerRow: FunctionComponent = () => {
  const theme = useTheme();
  return (
    <TableRow sx={{ backgroundColor: theme.palette.background.default }}>
      <TableCell colSpan={100} sx={{ height: '10px' }}></TableCell>
    </TableRow>
  );
};

export default SpacerRow;
