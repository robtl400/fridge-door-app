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
  TextField,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useKitchen } from "../context/KitchenContext";
import { validateUsername, USERNAME_MAX_LENGTH } from "../utils/validation";

function Welcome() {
  const {
    kitchenKey,
    isNewKitchen,
    needsOnboarding,
    createNewKitchen,
    dismissWelcome,
  } = useKitchen();

  const [step, setStep] = useState("username"); // "username" | "created"
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Show nothing if not onboarding and not a newly created kitchen
  if (!needsOnboarding && !isNewKitchen) return null;

  const handleUsernameChange = (e) => {
    const { value, error } = validateUsername(e.target.value);
    setUsername(value);
    setUsernameError(error);
  };

  const handleCreate = async () => {
    if (!username.trim() || usernameError) return;
    setCreating(true);
    const result = await createNewKitchen(username.trim());
    setCreating(false);
    if (result) {
      setStep("created");
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(kitchenKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silent fail
    }
  };

  // Step 1: Collect username (shown when needsOnboarding is true)
  if (needsOnboarding && step === "username") {
    return (
      <Dialog open maxWidth="sm" fullWidth>
        <DialogTitle>Welcome to ShelfLife</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Choose a username to get started. This will become part of your kitchen key.
          </Typography>
          <TextField
            fullWidth
            label="Username"
            placeholder="e.g. robert12"
            value={username}
            onChange={handleUsernameChange}
            error={!!usernameError}
            helperText={usernameError || `${username.length}/${USERNAME_MAX_LENGTH} characters`}
            slotProps={{ htmlInput: { maxLength: USERNAME_MAX_LENGTH } }}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={!username.trim() || !!usernameError || creating}
          >
            {creating ? "Creating..." : "Create My Kitchen"}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  // Step 2: Show the newly created key (shown when isNewKitchen is true)
  if (isNewKitchen) {
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
            Save this key to access your kitchen from other devices or share it with
            household members.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You can always find your key in Settings.
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

  return null;
}

export default Welcome;
