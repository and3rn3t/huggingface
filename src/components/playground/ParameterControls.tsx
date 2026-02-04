import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';

interface ParameterControlsProps {
  showAdvanced: boolean;
  parameters: {
    temperature?: boolean;
    maxTokens?: boolean;
    topP?: boolean;
  };
  temperature: number[];
  maxTokens: number[];
  topP: number[];
  onTemperatureChange: (value: number[]) => void;
  onMaxTokensChange: (value: number[]) => void;
  onTopPChange: (value: number[]) => void;
}

export function ParameterControls({
  showAdvanced,
  parameters,
  temperature,
  maxTokens,
  topP,
  onTemperatureChange,
  onMaxTokensChange,
  onTopPChange,
}: ParameterControlsProps) {
  return (
    <AnimatePresence>
      {showAdvanced && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="space-y-4 overflow-hidden"
        >
          {parameters.temperature && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Temperature</Label>
                <span className="text-xs text-muted-foreground">{temperature[0]}</span>
              </div>
              <Slider
                value={temperature}
                onValueChange={onTemperatureChange}
                min={0}
                max={2}
                step={0.1}
                className="py-2"
              />
            </div>
          )}

          {parameters.maxTokens && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Max Tokens</Label>
                <span className="text-xs text-muted-foreground">{maxTokens[0]}</span>
              </div>
              <Slider
                value={maxTokens}
                onValueChange={onMaxTokensChange}
                min={10}
                max={500}
                step={10}
                className="py-2"
              />
            </div>
          )}

          {parameters.topP && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Top P</Label>
                <span className="text-xs text-muted-foreground">{topP[0]}</span>
              </div>
              <Slider
                value={topP}
                onValueChange={onTopPChange}
                min={0}
                max={1}
                step={0.1}
                className="py-2"
              />
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
