import { WvIconButton } from './WvIconButton.js';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '../../theme/index.js';

interface WvBackButtonProps {
  onPress: () => void;
}

export function WvBackButton({ onPress }: WvBackButtonProps) {
  const theme = useTheme();
  return (
    <WvIconButton
      icon={<ArrowLeft size={20} color={theme.colors.textPrimary} />}
      onPress={onPress}
    />
  );
}
