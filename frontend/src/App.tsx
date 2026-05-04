import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { useWeb3 } from './hooks/useWeb3';
import { useState, useEffect } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { WalletConnect } from './components/WalletConnect';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { blockchainService } from './services/blockchain.service';
import { Alert, Paper, Button, Snackbar, TextField, Container, Typography } from '@mui/material';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#E84142', // Couleur Avalanche
    },
    secondary: {
      main: '#FFFFFF',
    },
  },
});

function App() {
  const { account, isConnected } = useWeb3();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as any,
  });

  useEffect(() => {
    if (isConnected && account) {
      fetchBalance();
    }
  }, [isConnected, account]);

  const fetchBalance = async () => {
    try {
      const bal = await blockchainService.getBalance(account!);
      setBalance(bal);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const handleSendTransaction = async () => {
    if (!recipient || !amount) {
      setSnackbar({ open: true, message: 'Please fill all fields', severity: 'error' });
      return;
    }

    setLoading(true);
    try {
      const txHash = await blockchainService.sendTransaction(recipient, amount);
      setSnackbar({
        open: true,
        message: `Transaction sent! Hash: ${txHash}`,
        severity: 'success',
      });
      setRecipient('');
      setAmount('');
      await fetchBalance();
    } catch (error: any) {
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}
            >
              <Typography variant="h4" component="h1" gutterBottom>
                Avalanche DApp
              </Typography>
              <WalletConnect />
            </Box>
            {isConnected ? (
              <>
                <Grid container spacing={3}>
                  <Grid size={12}>
                    <Alert severity="info">
                      Connected Account: {account}
                      <br />
                      Balance: {parseFloat(balance).toFixed(4)} AVAX
                    </Alert>
                  </Grid>
                  <Grid size={12}>
                    <Paper elevation={2} sx={{ p: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Send AVAX
                      </Typography>
                      <TextField
                        fullWidth
                        label="Recipient Address"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        margin="normal"
                        variant="outlined"
                      />
                      <TextField
                        fullWidth
                        label="Amount (AVAX)"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        margin="normal"
                        variant="outlined"
                      />
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={handleSendTransaction}
                        disabled={loading}
                        sx={{ mt: 2 }}
                      >
                        {loading ? 'Processing...' : 'Send Transaction'}
                      </Button>
                    </Paper>
                  </Grid>
                </Grid>
              </>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Please connect your wallet to interact with the DApp
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
}

export default App;
