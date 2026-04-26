import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '../../..';
import { FlatList } from 'react-native-gesture-handler';
import Checkbox from '../../Checkbox';
import { COMMUNITY } from '../../../libs/CONST';
import { navigate } from '../../../libs/NavigationUtils';
import { getString } from '../../../libs/localize';
import { workspaceDuplicationSelector } from '../../../selectors/workspace';
import { useWorkspaceDuplication } from '../../../hooks/useWorkspaceDuplication';
import { useTheme } from '../../../libs/ThemeUtils';
import { workspaceDuplicationActions } from '../../../redux/actions';

const SelectFeaturesScreen = () => {
  const { features, selectedFeatures, toggleFeature, isDuplicating } = useWorkspaceDuplication();
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{getString('Select features to copy')}</Text>
      <Text style={styles.subheader}>
        {getString('Which features do you want to copy over to your new workspace?')}
      </Text>
      <View style={styles.divider} />
      <FlatList
        data={features}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.featureItem}>
            <Checkbox
              checked={selectedFeatures.includes(item.id)}
              onPress={() => toggleFeature(item.id)}
              size={20}
              color={colors.accent}
            />
            <Text style={styles.featureName}>{item.name}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{getString('No features available to copy')}</Text>
          </View>
        }
      />
      <View style={styles.buttonContainer}>
        <Button
          title={getString('Back')}
          onPress={() => navigate('workspaceDuplicationSelect')}
          disabled={isDuplicating}
        />
        <Button
          title={getString('Next')}
          onPress={() => {
            workspaceDuplicationActions.copyFeatures(selectedFeatures);
            navigate('workspaceDuplicationName');
          }}
          disabled={isDuplicating || selectedFeatures.length === 0}
          type="primary"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
    color: '#000',
  },
  subheader: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  featureName: {
    flexShrink: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#000',
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
});

export default SelectFeaturesScreen;