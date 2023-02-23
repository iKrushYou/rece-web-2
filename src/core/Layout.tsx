import { FunctionComponent, PropsWithChildren } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { grey } from '@mui/material/colors';
import UnstyledLink from '../components/UnstyledLink';

const theme = createTheme({
  palette: {
    background: {
      default: grey[100],
    },
  },
});

const Layout: FunctionComponent<PropsWithChildren> = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ flexGrow: 1 }}>
        <CssBaseline />
        <AppBar position="static">
          <Toolbar>
            <UnstyledLink to={'/'}>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Rece
              </Typography>
            </UnstyledLink>
          </Toolbar>
        </AppBar>
        <Box sx={{ height: '20px' }} />
        {children}
      </Box>
    </ThemeProvider>
  );
};

export default Layout;
