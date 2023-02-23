import React, { FunctionComponent, PropsWithChildren } from 'react';
import { TableCellProps } from '@mui/material/TableCell/TableCell';
import TableCell from '@mui/material/TableCell';
import { ButtonBase } from '@mui/material';

const TableCellButton: FunctionComponent<PropsWithChildren<TableCellProps>> = ({ children, sx, ...otherProps }) => {
  return (
    <TableCell {...otherProps} sx={{ ...sx, position: 'relative' }}>
      <ButtonBase sx={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }} />
      {children}
    </TableCell>
  );
};

export default TableCellButton;
