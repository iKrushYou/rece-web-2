import React, { FunctionComponent, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Button, Card, CardContent, Modal, TextField } from '@mui/material';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

type UseEditTextModalShowProps = {
  value: string;
  setValue: (value: string) => void;
  title: string;
};
const useEditTextModal = () => {
  const [state, setState] = useState<UseEditTextModalShowProps & { open: boolean }>({
    open: false,
    value: '',
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    setValue: (value) => {},
    title: '',
  });

  const setOpen = (value: boolean) => {
    setState((prev) => ({ ...prev, open: value }));
  };

  const showEditTextModal = ({ value, setValue, title }: UseEditTextModalShowProps) => {
    setState({
      open: true,
      value,
      setValue,
      title,
    });
  };

  const Modal = (
    <EditTextModal open={state.open} handleClose={() => setOpen(false)} title={state.title} value={state.value} setValue={state.setValue} />
  );

  return { EditTextModal: Modal, showEditTextModal };
};

export default useEditTextModal;

const EditTextModal: FunctionComponent<{ open: boolean; handleClose: () => void } & UseEditTextModalShowProps> = ({
  open,
  handleClose,
  title,
  value,
  setValue,
}) => {
  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'calc(100% - 20px)',
    maxWidth: '600px',
    boxShadow: 24,
  };

  const fieldRef = useRef<HTMLInputElement>();
  const [fieldValue, setFieldValue] = useState('');
  const [valueSet, setValueSet] = useState(false);

  useEffect(() => {
    if (open) {
      setFieldValue(value);
      setValueSet(true);
    } else {
      setFieldValue('');
      setValueSet(false);
    }
  }, [value, open]);

  useLayoutEffect(() => {
    if (valueSet && fieldRef.current) {
      fieldRef.current.setSelectionRange(0, fieldRef.current.value.length);
    }
  }, [valueSet]);

  const handleSave = () => {
    setValue(fieldValue);
    handleClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Card sx={style}>
        <CardContent>
          <Typography variant="h6" component="h2" sx={{ mb: '20px' }}>
            {title}
          </Typography>
          <TextField
            variant={'standard'}
            value={fieldValue}
            onChange={(e) => setFieldValue(e.target.value)}
            sx={{ width: '100%' }}
            inputRef={fieldRef}
            autoFocus
            onKeyDown={(event) => {
              if (['Enter'].includes(event.code)) {
                handleSave();
              }
            }}
          />
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'right',
              mt: '20px',
              gap: '10px',
            }}
          >
            <Button onClick={handleClose}>Cancel</Button>
            <Button variant={'contained'} onClick={handleSave}>
              Save
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Modal>
  );
};
