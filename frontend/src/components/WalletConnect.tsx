import {
  Box,
  Chip,
  Menu,
  Alert,
  Button,
  Avatar,
  Snackbar,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import React from 'react';
import { useWeb3 } from '../hooks/useWeb3';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

export const WalletConnect: React.FC = () => {
  const { account, connectWallet, disconnectWallet, isConnected, isConnecting, error } = useWeb3();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [showError, setShowError] = React.useState(false);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDisconnect = () => {
    disconnectWallet();
    handleClose();
  };

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (err) {
      setShowError(true);
    }
  };

  React.useEffect(() => {
    if (error) {
      setShowError(true);
    }
  }, [error]);

  if (!isConnected) {
    return (
      <Box>
        <Button
          variant="contained"
          startIcon={<AccountBalanceWalletIcon />}
          onClick={handleConnect}
          disabled={isConnecting}
        >
          {isConnecting ? <CircularProgress size={24} /> : 'Connect Wallet'}
        </Button>

        <Snackbar
          open={showError && !!error}
          autoHideDuration={6000}
          onClose={() => setShowError(false)}
        >
          <Alert severity="error" onClose={() => setShowError(false)}>
            {error === 'MetaMask is not installed. Please install MetaMask extension.'
              ? "MetaMask n'est pas installé. Veuillez installer l'extension MetaMask."
              : error}
          </Alert>
        </Snackbar>
      </Box>
    );
  }

  const shortenedAddress = `${account?.slice(0, 6)}...${account?.slice(-4)}`;

  return (
    <Box>
      <Chip
        avatar={
          <Avatar>
            <AccountBalanceWalletIcon />
          </Avatar>
        }
        label={shortenedAddress}
        onClick={handleClick}
        color="primary"
        variant="outlined"
      />
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={handleDisconnect}>
          <LogoutIcon sx={{ mr: 1 }} />
          Disconnect
        </MenuItem>
      </Menu>
    </Box>
  );
};
