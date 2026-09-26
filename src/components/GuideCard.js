// Displays a guide summary card with type, votes and community approval status.
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { getGuideTypeColor } from '../utils/guideUtils';
import { normalizeContentBlocks } from '../utils/guideStorage';

// Displays a guide preview and shows its first image or disaster icon.
export default function GuideCard({ guide, onPress, cardStyle }) {
  const typeColor = getGuideTypeColor(guide.type);
  const firstImage = normalizeContentBlocks(guide).find((b) => b.type === 'image' && b.imageUri)?.imageUri;
  return (
    <Pressable style={[styles.card, cardStyle]} onPress={onPress} accessibilityRole="button" accessibilityLabel={`Open ${guide.title}`}>
      <View style={[styles.art, { backgroundColor: typeColor.bg }]}>
        {firstImage ? <Image source={{ uri: firstImage }} style={styles.artImage} resizeMode="cover" /> : <Ionicons name={typeColor.icon} size={54} color={typeColor.fg} />}
      </View>
      {guide.promotedFromCommunity ? <View style={styles.approvedBadge}><Ionicons name="shield-checkmark-outline" size={13} color={COLORS.primary} /><Text style={styles.approvedText}>Community-approved</Text></View> : null}
      <Text style={styles.title}>{guide.title}</Text>
      <Text style={styles.summary}>{guide.summary}</Text>
      <View style={styles.voteRow}><Ionicons name="arrow-up" size={18} color={COLORS.orange} /><Text style={styles.voteText}>{guide.votes}</Text></View>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  card:{width:160,backgroundColor:COLORS.card,borderRadius:18,borderWidth:1,borderColor:COLORS.border,padding:12,shadowColor:'#0B245D',shadowOpacity:.06,shadowRadius:10,shadowOffset:{width:0,height:4},elevation:2,marginRight:14},
  art:{height:120,borderRadius:16,alignItems:'center',justifyContent:'center',marginBottom:10,overflow:'hidden'},artImage:{width:'100%',height:'100%'},
  approvedBadge:{alignSelf:'flex-start',flexDirection:'row',alignItems:'center',gap:4,backgroundColor:COLORS.primarySoft,borderRadius:999,paddingHorizontal:8,paddingVertical:5,marginBottom:7},approvedText:{color:COLORS.primary,fontSize:10,fontWeight:'800'},
  title:{color:COLORS.text,fontSize:16,fontWeight:'800',minHeight:40},summary:{color:COLORS.textMuted,fontSize:14,lineHeight:20,minHeight:58,marginTop:6},voteRow:{marginTop:10,flexDirection:'row',alignItems:'center',gap:4},voteText:{fontSize:16,fontWeight:'700',color:COLORS.text}
});
