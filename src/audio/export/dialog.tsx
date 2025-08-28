import { registerMp3Encoder } from "@mediabunny/mp3-encoder";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  TextField,
  type SelectChangeEvent,
} from "@mui/material";
import {
  AdtsOutputFormat,
  ALL_FORMATS,
  BlobSource,
  BufferTarget,
  canEncodeAudio,
  Conversion,
  Input,
  Mp3OutputFormat,
  OggOutputFormat,
  Output,
  WavOutputFormat,
} from "mediabunny";
import { useState, type ChangeEvent, type Dispatch, type SetStateAction } from "react";

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  file: File;
  duration: number[];
}

type SupportedFormats = "mp3" | "ogg" | "wav" | "adts";

function ExportDialog({ open, setOpen, file, duration }: Props) {
  const [fileName, setFilename] = useState<string>("");
  const [format, setFormat] = useState<SupportedFormats>("mp3");
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [cancelExport, setCancelExport] = useState<Conversion | null>(null);

  const initMP3 = async () => {
    if (!(await canEncodeAudio("mp3"))) {
      registerMp3Encoder();
    }

    return new Mp3OutputFormat();
  };
  const outputFormats = async () => {
    return {
      mp3: await initMP3(),
      ogg: new OggOutputFormat(),
      wav: new WavOutputFormat(),
      adts: new AdtsOutputFormat(),
    };
  };

  const onClose = () => {
    setProgress(0);
    setFilename("");
    setFormat("mp3");
    if (cancelExport) {
      cancelExport.cancel();
    }
    setIsExporting(false);
    setOpen(false);
  };

  const handleFilename = (event: ChangeEvent<HTMLInputElement>) => {
    setFilename(event.target.value);
  };
  const handleSelect = (event: SelectChangeEvent) => {
    setFormat(event.target.value as SupportedFormats);
  };

  const exportAudio = async (source: File) => {
    if (progress !== 0) {
      setProgress(0);
    }

    const input = new Input({
      formats: ALL_FORMATS,
      source: new BlobSource(source),
    });
    const outputs = await outputFormats();
    const output = new Output({
      format: outputs[format],
      target: new BufferTarget(),
    });

    const conversion = await Conversion.init({
      input: input,
      output: output,
      trim: {
        start: duration[0],
        end: duration[1],
      },
    });

    setCancelExport(conversion);

    conversion.onProgress = (progress: number) => {
      setProgress(progress * 100);
    };
    setIsExporting(true);

    await conversion.execute();
    const file = new File([output.target.buffer!], fileName + output.format.fileExtension);

    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();

    URL.revokeObjectURL(url);
    setIsExporting(false);
  };
  return (
    <Dialog className="export-dialog" open={open} onClose={onClose} maxWidth={"sm"} fullWidth={true}>
      <DialogTitle>Export File</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <FormControl sx={{ m: 1, width: "80%" }} size="small">
            <TextField
              id="filename"
              required
              type="text"
              label="Filename"
              size="small"
              onChange={handleFilename}></TextField>
          </FormControl>
          <FormControl sx={{ m: 1, width: "20%" }} size="small">
            <InputLabel id="select-format">Format</InputLabel>
            <Select id="select-format" label="Format" value={format} onChange={handleSelect} size="small">
              <MenuItem value="mp3">MP3</MenuItem>
              <MenuItem value="ogg">OGG</MenuItem>
              <MenuItem value="wav">WAV</MenuItem>
              <MenuItem value="adts">ADTS</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Box sx={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Button onClick={onClose}>Cancel</Button>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ width: "65%", visibility: isExporting ? "visible" : "hidden" }}
          />
          <Button type="submit" onClick={() => exportAudio(file)} disabled={isExporting}>
            Export File
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default ExportDialog;
