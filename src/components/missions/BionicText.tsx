import React from 'react';
import { Text, TextStyle } from 'react-native';
import { tokenizeBionicText } from '../../services/accessibility/bionicReading';
import { UserAccessibilityPreferences } from '../../types/user';

interface BionicTextProps {
  children: string;
  preferences?: UserAccessibilityPreferences;
  style?: TextStyle;
}

export const BionicText: React.FC<BionicTextProps> = ({
  children,
  preferences,
  style
}) => {
  if (!children) return null;

  const isBionic = preferences?.bionicReading ?? false;
  if (!isBionic) {
    return <Text style={style}>{children}</Text>;
  }

  const fixation = preferences?.bionicFixation ?? 0.45;
  const opacity = preferences?.bionicOpacity ?? 0.55;
  const tokens = tokenizeBionicText(children, fixation, opacity);

  return (
    <Text style={style}>
      {tokens.map((token, idx) => {
        if (typeof token === 'string') {
          return token;
        }

        return (
          <Text key={idx}>
            {token.prefix}
            <Text style={{ fontWeight: '800' }}>{token.bold}</Text>
            <Text style={{ opacity }}>{token.normal}</Text>
            {token.suffix}
          </Text>
        );
      })}
    </Text>
  );
};
