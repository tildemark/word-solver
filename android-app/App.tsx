import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';
import { universalSolver } from '../src/lib/solver';
import * as Clipboard from 'expo-clipboard';

// Minimal word list for demo; replace with a real list or load from file
const DICTIONARY = [
  'apple', 'angle', 'alien', 'baker', 'cable', 'eagle', 'table', 'zebra', 'other', 'words', 'here'
];

export default function App() {
  const [pattern, setPattern] = useState('.....');
  const [mustContain, setMustContain] = useState('');
  const [mustExclude, setMustExclude] = useState('');
  const [copied, setCopied] = useState('');

  const results = useMemo(() => {
    if (pattern === '.....' && !mustContain && !mustExclude) return [];
    return universalSolver({
      dictionary: DICTIONARY,
      pattern,
      mustContain,
      mustExclude
    });
  }, [pattern, mustContain, mustExclude]);

  const handleCopy = (word) => {
    Clipboard.setStringAsync(word);
    setCopied(word);
    Alert.alert('Copied', `${word} copied to clipboard!`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Word Solver</Text>
      <Text style={styles.subtitle}>Enter pattern, required, and excluded letters.</Text>
      <TextInput
        style={styles.input}
        value={pattern}
        onChangeText={setPattern}
        placeholder="Pattern (e.g. S..RE)"
        autoCapitalize="characters"
      />
      <TextInput
        style={styles.input}
        value={mustContain}
        onChangeText={setMustContain}
        placeholder="Must Contain (e.g. EA)"
        autoCapitalize="characters"
      />
      <TextInput
        style={styles.input}
        value={mustExclude}
        onChangeText={setMustExclude}
        placeholder="Must Exclude (e.g. XYZ)"
        autoCapitalize="characters"
      />
      <Text style={styles.resultCount}>Possible Matches ({results.length})</Text>
      <FlatList
        data={results.slice(0, 100)}
        keyExtractor={(item) => item}
        numColumns={3}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.wordBox} onPress={() => handleCopy(item)}>
            <Text style={styles.word}>{item}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No words found.</Text>}
      />
      <Text style={styles.info}>Tap a word to copy it to clipboard.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181b',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#34d399',
    marginBottom: 8,
  },
  subtitle: {
    color: '#a1a1aa',
    marginBottom: 16,
  },
  input: {
    width: '100%',
    backgroundColor: '#27272a',
    color: '#f1f5f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#52525b',
  },
  resultCount: {
    color: '#a1a1aa',
    marginBottom: 8,
    fontSize: 16,
  },
  wordBox: {
    backgroundColor: '#27272a',
    borderRadius: 8,
    padding: 12,
    margin: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#52525b',
    minWidth: 80,
  },
  word: {
    color: '#f1f5f9',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  empty: {
    color: '#a1a1aa',
    marginTop: 24,
    textAlign: 'center',
  },
  info: {
    color: '#a1a1aa',
    marginTop: 16,
    fontSize: 12,
    textAlign: 'center',
  },
});
