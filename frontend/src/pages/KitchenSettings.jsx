import { useState } from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  Paper,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ShareIcon from "@mui/icons-material/Share";
import { useKitchen, getRecentKitchens } from "../context/KitchenContext";
import { updateKitchenName } from "../services/kitchenApi";

function KitchenSettings() {
  const { kitchenKey, kitchenInfo, switchKitchen, createNewKitchen } =
    useKitchen();

  const [copySuccess, setCopySuccess] = useState(false);
  const [switchInput, setSwitchInput] = useState("");
  const [switchError, setSwitchError] = useState("");
  const [nameInput, setNameInput] = useState(kitchenInfo?.name || "");
  const [nameSaved, setNameSaved] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(null); // "switch" | "new" | null

  const recentKitchens = getRecentKitchens().filter((k) => k !== kitchenKey);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(kitchenKey);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = kitchenKey;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleShareLink = async () => {
    const url = `${window.location.origin}/?kitchen=${kitchenKey}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      // silent fail
    }
  };

  const handleSwitch = async () => {
    setSwitchError("");
    const key = switchInput.trim();
    if (!key) return;
    const ok = await switchKitchen(key);
    if (!ok) {
      setSwitchError("Kitchen not found. Check the key and try again.");
    }
    setConfirmDialog(null);
  };

  const handleCreateNew = async () => {
    await createNewKitchen();
    setConfirmDialog(null);
  };

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    await updateKitchenName(kitchenKey, nameInput.trim());
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2000);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Kitchen Settings
      </Typography>

      {/* Current Kitchen Key */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Your Kitchen Key
        </Typography>
        <Typography
          variant="h5"
          component="p"
          sx={{ fontFamily: "monospace", my: 1 }}
        >
          {kitchenKey}
        </Typography>
        {kitchenInfo?.name && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {kitchenInfo.name}
          </Typography>
        )}
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ContentCopyIcon />}
            onClick={handleCopy}
          >
            {copySuccess ? "Copied!" : "Copy Key"}
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ShareIcon />}
            onClick={handleShareLink}
          >
            Copy Share Link
          </Button>
        </Box>
      </Paper>

      {/* Kitchen Name */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Kitchen Name
        </Typography>
        <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
          <TextField
            size="small"
            fullWidth
            placeholder="e.g. Smith Family Kitchen"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
          />
          <Button variant="contained" size="medium" onClick={handleSaveName}>
            Save
          </Button>
        </Box>
        {nameSaved && (
          <Alert severity="success" sx={{ mt: 1 }}>
            Name saved!
          </Alert>
        )}
      </Paper>

      <Divider sx={{ my: 3 }} />

      {/* Switch Kitchen */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Enter a Different Key
        </Typography>
        <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
          <TextField
            size="small"
            fullWidth
            placeholder="kitchen_abc123"
            value={switchInput}
            onChange={(e) => {
              setSwitchInput(e.target.value);
              setSwitchError("");
            }}
          />
          <Button
            variant="contained"
            size="medium"
            onClick={() => setConfirmDialog("switch")}
            disabled={!switchInput.trim()}
          >
            Switch
          </Button>
        </Box>
        {switchError && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {switchError}
          </Alert>
        )}

        {recentKitchens.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Recent kitchens:
            </Typography>
            {recentKitchens.map((key) => (
              <Button
                key={key}
                size="small"
                sx={{ display: "block", fontFamily: "monospace", textTransform: "none" }}
                onClick={() => setSwitchInput(key)}
              >
                {key}
              </Button>
            ))}
          </Box>
        )}
      </Paper>

      {/* Create New Kitchen */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Start Fresh
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Create a new empty kitchen. You can always switch back to this one
          using your current key.
        </Typography>
        <Button
          variant="outlined"
          color="warning"
          onClick={() => setConfirmDialog("new")}
        >
          Create New Kitchen
        </Button>
      </Paper>

      {/* Confirmation Dialogs */}
      <Dialog
        open={confirmDialog === "switch"}
        onClose={() => setConfirmDialog(null)}
      >
        <DialogTitle>Switch Kitchen?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You&apos;ll leave your current kitchen and load a different one. Your
            current data won&apos;t be deleted — save your current key (
            <strong>{kitchenKey}</strong>) to come back later.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(null)}>Cancel</Button>
          <Button onClick={handleSwitch} variant="contained">
            Switch
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmDialog === "new"}
        onClose={() => setConfirmDialog(null)}
      >
        <DialogTitle>Create New Kitchen?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will create a brand new empty kitchen. To access your current
            pantry again, you&apos;ll need your current key:{" "}
            <strong>{kitchenKey}</strong>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(null)}>Cancel</Button>
          <Button onClick={handleCreateNew} variant="contained" color="warning">
            Create New
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default KitchenSettings;
