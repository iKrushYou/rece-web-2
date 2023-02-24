import React, { FunctionComponent, PropsWithChildren } from 'react';
import { TableCellProps } from '@mui/material/TableCell/TableCell';
import TableCell from '@mui/material/TableCell';
import { ButtonBase } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ButtonBaseProps } from '@mui/material/ButtonBase';

const StyledTableCell = styled(TableCell)(() => ({
  position: 'relative',
}));

const TableCellButton: FunctionComponent<
  PropsWithChildren<Omit<TableCellProps, 'onClick'> & Pick<ButtonBaseProps, 'onClick'> & { disabled: boolean }>
> = ({ children, disabled = false, onClick, ...otherProps }) => {
  return (
    <StyledTableCell {...otherProps}>
      <ButtonBase
        sx={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }}
        // onClick={!disabled ? onClick : (() => {})}
        onClick={onClick}
        disabled={disabled}
      />
      {children}
    </StyledTableCell>
  );
};

export default TableCellButton;
