import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Alert,
  Box,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useKitchen } from "../context/KitchenContext";

function Welcome() {
  const { kitchenKey, isNewKitchen, dismissWelcome } = useKitchen();
  const [copied, setCopied] = useState(false);

  if (!isNewKitchen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(kitchenKey);
      setCopied(true);
    } catch {
      // silent fail
    }
  };

  return (
    <Dialog open onClose={dismissWelcome} maxWidth="sm" fullWidth>
      <DialogTitle>Your kitchen has been created!</DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Your kitchen key is:
        </Typography>
        <Alert severity="info" sx={{ fontFamily: "monospace", fontSize: "1.2rem", mb: 2 }}>
          {kitchenKey}
        </Alert>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Save this key to access your pantry from other devices.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Share this key with household members to share the same pantry.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Box sx={{ display: "flex", gap: 1, width: "100%", justifyContent: "flex-end", p: 1 }}>
          <Button
            variant="outlined"
            startIcon={<ContentCopyIcon />}
            onClick={handleCopy}
          >
            {copied ? "Copied!" : "Copy Key"}
          </Button>
          <Button variant="contained" onClick={dismissWelcome}>
            Got it
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default Welcome;
