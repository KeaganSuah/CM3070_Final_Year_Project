// Provides the mixed-media community guide editor and dynamic quiz builder.
import React, { useState } from 'react';
import { Alert, Image, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../constants/theme';
import AppHeader from '../components/AppHeader';
import FilterChip from '../components/FilterChip';
import { DISASTER_TYPES } from '../constants/options';
import { persistGuideImage } from '../utils/mediaUtils';
import { successFeedback } from '../utils/deviceFeedback';

// Creates a short unique ID for new guide blocks, questions and options.
const id = (p='x') => `${p}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
// Creates a blank MCQ with two answer options and the first answer selected.
const emptyQuestion = () => ({ id:id('q'), question:'', options:['',''], answerIndex:0 });
// Creates a blank text block for the mixed-media guide editor.
const textBlock = () => ({ id:id('text'), type:'text', text:'', caption:'', imageUri:null });

// Lets a community user build guide content, images and quiz questions.
export default function CreateGuideScreen({ navigation, onSubmitGuide }) {
  const [title,setTitle]=useState(''); const [type,setType]=useState('General'); const [summary,setSummary]=useState('');
  const [blocks,setBlocks]=useState([textBlock()]); const [questions,setQuestions]=useState([emptyQuestion()]); const [busy,setBusy]=useState(false);
  // Updates one guide content block without changing the other blocks.
  const updateBlock=(blockId,patch)=>setBlocks(c=>c.map(b=>b.id===blockId?{...b,...patch}:b));
  // Removes one text or image block from the guide draft.
  const removeBlock=(blockId)=>setBlocks(c=>c.filter(b=>b.id!==blockId));
  // Updates one quiz question while keeping the rest of the quiz unchanged.
  const updateQuestion=(qid,patch)=>setQuestions(c=>c.map(q=>q.id===qid?{...q,...patch}:q));
  // Adds another answer option to a quiz question up to the allowed limit.
  const addOption=(qid)=>setQuestions(c=>c.map(q=>q.id===qid&&q.options.length<6?{...q,options:[...q.options,'']}:q));
  // Removes an answer option while keeping a valid correct-answer index.
  const removeOption=(qid,idx)=>setQuestions(c=>c.map(q=>{if(q.id!==qid||q.options.length<=2)return q;const opts=q.options.filter((_,i)=>i!==idx);return {...q,options:opts,answerIndex:Math.min(q.answerIndex,opts.length-1)};}));

  // Requests the needed permission, picks an image and stores it in the selected block.
  const chooseGuideImage=async(blockId,source='library')=>{
    setBusy(true);
    try{
      if(source==='camera'){
        const permission=await ImagePicker.requestCameraPermissionsAsync();
        if(!permission.granted){Alert.alert('Camera permission needed','Allow camera access only if you want to capture an image for this guide.');return;}
      }else if(Platform.OS!=='web'){
        const permission=await ImagePicker.requestMediaLibraryPermissionsAsync();
        if(!permission.granted){Alert.alert('Photo permission needed','Allow photo access only if you want to choose an image for this guide.');return;}
      }
      const result=source==='camera'
        ? await ImagePicker.launchCameraAsync({mediaTypes:['images'],quality:.8})
        : await ImagePicker.launchImageLibraryAsync({mediaTypes:['images'],quality:.8,selectionLimit:1});
      if(!result.canceled){const uri=await persistGuideImage(result.assets?.[0]); updateBlock(blockId,{imageUri:uri}); await successFeedback();}
    }finally{setBusy(false);}
  };

  // Validates the mixed-media guide and publishes it when the required content is complete.
  const submit=()=>{
    const cleanBlocks=blocks.filter(b=>b.type==='image'?b.imageUri:b.text.trim()).map(b=>({...b,text:b.text?.trim()||'',caption:b.caption?.trim()||''}));
    const plain=cleanBlocks.filter(b=>b.type==='text').map(b=>b.text).join('\n\n');
    if(title.trim().length<4||summary.trim().length<8||plain.length<20){Alert.alert('Incomplete guide','Add a title, summary and at least one useful text block.');return;}
    const quiz=questions.filter(q=>q.question.trim()&&q.options.length>=2&&q.options.every(o=>o.trim())).map(q=>({...q,question:q.question.trim(),options:q.options.map(o=>o.trim())}));
    if(!quiz.length){Alert.alert('Add a quiz','Include at least one complete MCQ question.');return;}
    onSubmitGuide({title:title.trim(),type,summary:summary.trim(),body:plain,contentBlocks:cleanBlocks,quiz}); navigation.goBack();
  };

  return <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <AppHeader/><View style={styles.header}><Pressable onPress={()=>navigation.goBack()} style={styles.iconButton}><Ionicons name="close" size={22} color={COLORS.text}/></Pressable><Text style={styles.title}>Create guide</Text><View style={styles.iconButton}/></View>
    <Text style={styles.label}>Guide title</Text><TextInput value={title} onChangeText={setTitle} placeholder="Example: Apartment Flood Safety" placeholderTextColor={COLORS.textMuted} style={styles.input}/>
    <Text style={styles.label}>Disaster type</Text><View style={styles.wrapRow}>{['General',...DISASTER_TYPES.slice(1)].map(x=><FilterChip key={x} label={x==='Power Outage'?'Power':x} active={type===x} onPress={()=>setType(x)}/>)}</View>
    <Text style={styles.label}>Short summary</Text><TextInput value={summary} onChangeText={setSummary} placeholder="Short description for the guide card" placeholderTextColor={COLORS.textMuted} style={styles.input}/>

    <View style={styles.sectionHeader}><View><Text style={styles.titleSmall}>Guide content</Text><Text style={styles.hint}>Build the guide from ordered text and image blocks.</Text></View></View>
    {blocks.map((b,index)=><View key={b.id} style={styles.blockCard}>
      <View style={styles.blockTop}><Text style={styles.blockTitle}>{b.type==='text'?`Text block ${index+1}`:`Image block ${index+1}`}</Text>{blocks.length>1?<Pressable onPress={()=>removeBlock(b.id)}><Ionicons name="trash-outline" size={20} color={COLORS.danger}/></Pressable>:null}</View>
      {b.type==='text'?<TextInput value={b.text} onChangeText={text=>updateBlock(b.id,{text})} multiline textAlignVertical="top" placeholder="Write this section of the guide" placeholderTextColor={COLORS.textMuted} style={[styles.input,styles.textArea]}/>:<>
        {b.imageUri?<Image source={{uri:b.imageUri}} style={styles.preview}/>:<View style={styles.imagePlaceholder}><Ionicons name="image-outline" size={36} color={COLORS.textMuted}/><Text style={styles.hint}>No image selected</Text></View>}
        <View style={styles.imageActions}><Pressable style={styles.smallButton} disabled={busy} onPress={()=>chooseGuideImage(b.id,'library')}><Ionicons name="images-outline" size={17} color={COLORS.primary}/><Text style={styles.smallButtonText}>Choose</Text></Pressable><Pressable style={styles.smallButton} disabled={busy} onPress={()=>chooseGuideImage(b.id,'camera')}><Ionicons name="camera-outline" size={17} color={COLORS.primary}/><Text style={styles.smallButtonText}>Camera</Text></Pressable></View>
        <TextInput value={b.caption} onChangeText={caption=>updateBlock(b.id,{caption})} placeholder="Image caption / accessibility description (optional)" placeholderTextColor={COLORS.textMuted} style={[styles.input,{marginTop:10}]}/>
      </>}
    </View>)}
    <View style={styles.addRow}><Pressable style={styles.addPill} onPress={()=>setBlocks(c=>[...c,textBlock()])}><Ionicons name="text-outline" size={18} color={COLORS.primary}/><Text style={styles.addText}>Add text</Text></Pressable><Pressable style={styles.addPill} onPress={()=>setBlocks(c=>[...c,{id:id('image'),type:'image',imageUri:null,caption:'',text:''}])}><Ionicons name="image-outline" size={18} color={COLORS.primary}/><Text style={styles.addText}>Add image</Text></Pressable></View>

    <View style={styles.quizHeader}><Text style={styles.titleSmall}>Quiz questions</Text><Pressable style={styles.addQuestionButton} onPress={()=>setQuestions(c=>[...c,emptyQuestion()])}><Ionicons name="add" size={18} color={COLORS.primary}/><Text style={styles.addText}>Add question</Text></Pressable></View>
    {questions.map((q,index)=><View key={q.id} style={styles.questionCard}><View style={styles.blockTop}><Text style={styles.blockTitle}>Question {index+1}</Text>{questions.length>1?<Pressable onPress={()=>setQuestions(c=>c.filter(x=>x.id!==q.id))}><Ionicons name="trash-outline" size={20} color={COLORS.danger}/></Pressable>:null}</View><TextInput value={q.question} onChangeText={question=>updateQuestion(q.id,{question})} placeholder="Enter the MCQ question" placeholderTextColor={COLORS.textMuted} style={styles.input}/>{q.options.map((opt,i)=><View key={i} style={styles.optionRow}><Pressable onPress={()=>updateQuestion(q.id,{answerIndex:i})} style={[styles.radioOuter,q.answerIndex===i&&styles.radioActive]}>{q.answerIndex===i?<View style={styles.radioInner}/>:null}</Pressable><TextInput value={opt} onChangeText={text=>{const opts=[...q.options];opts[i]=text;updateQuestion(q.id,{options:opts});}} placeholder={`Option ${i+1}`} placeholderTextColor={COLORS.textMuted} style={[styles.input,{flex:1}]}/>{q.options.length>2?<Pressable onPress={()=>removeOption(q.id,i)}><Ionicons name="remove-circle-outline" size={20} color={COLORS.danger}/></Pressable>:null}</View>)}<Pressable style={styles.addQuestionButton} onPress={()=>addOption(q.id)}><Ionicons name="add-circle-outline" size={18} color={COLORS.primary}/><Text style={styles.addText}>Add option</Text></Pressable><Text style={styles.hint}>Tap the circle to mark the correct answer.</Text></View>)}
    <Pressable style={styles.submitButton} onPress={submit}><Text style={styles.submitText}>Publish community guide</Text></Pressable>
  </ScrollView>;
}

const styles=StyleSheet.create({container:{flex:1,backgroundColor:COLORS.background},content:{padding:20,paddingBottom:60},header:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginTop:8,marginBottom:10},iconButton:{width:40,height:40,borderRadius:20,borderWidth:1,borderColor:COLORS.border,backgroundColor:COLORS.card,alignItems:'center',justifyContent:'center'},title:{fontSize:22,fontWeight:'800',color:COLORS.text},label:{marginTop:16,marginBottom:8,color:COLORS.text,fontWeight:'700',fontSize:16},input:{backgroundColor:COLORS.card,borderWidth:1,borderColor:COLORS.border,borderRadius:16,paddingHorizontal:14,paddingVertical:12,color:COLORS.text,fontSize:16},textArea:{minHeight:120},wrapRow:{flexDirection:'row',flexWrap:'wrap',gap:10},sectionHeader:{marginTop:22},titleSmall:{fontSize:18,fontWeight:'800',color:COLORS.text},hint:{color:COLORS.textMuted,fontSize:13,lineHeight:19,marginTop:4},blockCard:{marginTop:12,backgroundColor:COLORS.card,borderWidth:1,borderColor:COLORS.border,borderRadius:18,padding:14},blockTop:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:10},blockTitle:{color:COLORS.text,fontWeight:'800'},preview:{width:'100%',height:190,borderRadius:14,backgroundColor:COLORS.border},imagePlaceholder:{height:150,borderRadius:14,backgroundColor:COLORS.primarySoft,alignItems:'center',justifyContent:'center'},imageActions:{flexDirection:'row',gap:10,marginTop:10},smallButton:{flexDirection:'row',gap:6,alignItems:'center',paddingHorizontal:12,paddingVertical:9,borderRadius:12,borderWidth:1,borderColor:COLORS.border},smallButtonText:{color:COLORS.primary,fontWeight:'700'},addRow:{flexDirection:'row',gap:10,marginTop:12},addPill:{flexDirection:'row',alignItems:'center',gap:6,borderWidth:1,borderColor:COLORS.primary,borderRadius:999,paddingHorizontal:14,paddingVertical:10},addText:{color:COLORS.primary,fontWeight:'700'},quizHeader:{marginTop:24,flexDirection:'row',justifyContent:'space-between',alignItems:'center'},addQuestionButton:{flexDirection:'row',alignItems:'center',gap:5,marginTop:10},questionCard:{marginTop:14,backgroundColor:COLORS.card,borderWidth:1,borderColor:COLORS.border,borderRadius:18,padding:14},optionRow:{flexDirection:'row',alignItems:'center',gap:10,marginTop:10},radioOuter:{width:24,height:24,borderRadius:12,borderWidth:2,borderColor:COLORS.border,alignItems:'center',justifyContent:'center'},radioActive:{borderColor:COLORS.primary},radioInner:{width:10,height:10,borderRadius:5,backgroundColor:COLORS.primary},submitButton:{marginTop:24,backgroundColor:COLORS.primary,borderRadius:18,paddingVertical:16,alignItems:'center'},submitText:{color:'#FFF',fontWeight:'800',fontSize:16}});
