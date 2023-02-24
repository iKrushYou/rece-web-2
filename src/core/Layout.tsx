import { FunctionComponent, PropsWithChildren } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import UnstyledLink from '../components/UnstyledLink';
import useMediaQuery from '@mui/material/useMediaQuery';

declare module '@mui/material/styles' {
  interface Palette {
    highlightedRowBg: string;
    tableBg: string;
  }
  interface PaletteOptions {
    highlightedRowBg: string;
    tableBg: string;
  }
}

const theme = createTheme({
  palette: {
    highlightedRowBg: '#fff8d6',
    tableBg: '#fff',
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    highlightedRowBg: '#362d00',
    tableBg: '#212121',
  },
});

const Layout: FunctionComponent<PropsWithChildren> = ({ children }) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  return (
    <ThemeProvider theme={prefersDarkMode ? darkTheme : theme}>
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
