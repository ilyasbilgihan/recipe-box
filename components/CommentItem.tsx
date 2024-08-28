import { View, Text, Image, Alert } from 'react-native';
import React, { useState } from 'react';
import Collapsible from 'react-native-collapsible';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '~/utils/supabase';
import { useGlobalContext } from '~/context/GlobalProvider';
import Comments from './Comments';
import { Button, ButtonText } from './ui/button';
import { Textarea, TextareaInput } from './ui/textarea';
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from './ui/select';
import { router } from 'expo-router';
import useCustomToast from './useCustomToast';

const CommentItem = ({ comment, refreshComments, handleAddComment }: any) => {
  const [repliesExpanded, setRepliesExpanded] = useState(false);
  const [replyFormExpanded, setReplyFormExpanded] = useState(false);
  const [voteLoading, setVoteLoading] = useState(false);
  const [userVote, setUserVote] = useState(0);
  const [content, setContent] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const { session } = useGlobalContext();

  const toast = useCustomToast();

  const handleDownVote = async () => {
    setVoteLoading(true);
    console.log('try downvote');
    const currentVote = await checkVote();

    await removeVote();
    if (currentVote != -1) {
      console.log('downvote');
      const { error } = await supabase
        .from('comment_reaction')
        .upsert({ comment_id: comment.id, user_id: session?.user.id, reaction: -1 });
      if (error) {
        console.log('downvote error', error);
      } else {
        setUserVote(-1);
        refreshComments();
      }
    }
    setVoteLoading(false);
  };

  const handleUpVote = async () => {
    setVoteLoading(true);
    console.log('try upvote');
    const currentVote = await checkVote();

    await removeVote();
    if (currentVote != 1) {
      console.log('downvote');
      await removeVote();
      const { error } = await supabase
        .from('comment_reaction')
        .upsert({ comment_id: comment.id, user_id: session?.user.id, reaction: 1 });
      if (error) {
        console.log('upvote error', error);
      } else {
        setUserVote(1);
        refreshComments();
      }
    }
    setVoteLoading(false);
  };

  const removeVote = async () => {
    console.log('remove vote');
    const { error } = await supabase
      .from('comment_reaction')
      .delete()
      .eq('comment_id', comment.id)
      .eq('user_id', session?.user.id);
    if (error) {
      console.log('removevote error', error);
    } else {
      setUserVote(0);
      refreshComments();
    }
  };

  const checkVote = async () => {
    const { data, error } = await supabase
      .from('comment_reaction')
      .select('reaction')
      .eq('comment_id', comment.id)
      .eq('user_id', session?.user.id)
      .single();

    if (error) {
      console.log('checkvote error', error);
    }

    setUserVote(data?.reaction);
    return data?.reaction || 0;
  };

  const handleEditComment = async () => {
    console.log('edit comment', comment.id);
    const { data, error } = await supabase
      .from('comment')
      .update({ content: editContent })
      .eq('id', comment.id);

    if (error) {
      toast.error('Edit Comment Error. ' + error.message);
    } else {
      setEditMode(false);
      refreshComments();
    }
  };

  const handleCommentDelete = async () => {
    const { data, error } = await supabase.from('comment').delete().eq('id', comment.id);

    if (error) {
      if (error.code == '23503') {
        const { error: updtErr } = await supabase
          .from('comment')
          .update({ deleted: true })
          .eq('id', comment.id);
      }
    }

    refreshComments();
  };

  return (
    <View key={comment.id}>
      <View className=" flex-row items-center gap-4">
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => {
            if (comment?.deleted) return;
            router.push(`/profile/${comment?.profile?.id}`);
          }}>
          <View className="flex-row items-center gap-3">
            <Image
              source={
                !comment?.profile?.profile_image || comment?.deleted
                  ? require('~/assets/images/no-image.png')
                  : { uri: comment?.profile?.profile_image }
              }
              className="h-10 w-10 rounded-md"
            />
            <Text className="font-qs-bold text-lg text-dark">
              {comment?.deleted
                ? 'Anonymous'
                : comment?.profile?.name || '@' + comment?.profile?.username}
            </Text>
          </View>
        </TouchableOpacity>
        {comment?.profile?.id == session?.user.id && !comment?.deleted ? (
          <Select
            onValueChange={(value) => {
              if (value == 'edit') {
                setEditMode(!editMode);
              } else if (value == 'delete') {
                toast.confirm({
                  title: 'Are you sure you want to delete this comment?',
                  message: comment?.content,
                  icon: <Ionicons name="trash-outline" size={20} />,
                  handler: async () => {
                    await handleCommentDelete();
                  },
                });
              }
            }}>
            <SelectTrigger className="border-0 " size="md">
              <Ionicons size={18} name="ellipsis-horizontal" color={'rgb(42 48 81)'} />
            </SelectTrigger>
            <SelectPortal>
              <SelectBackdrop />
              <SelectContent>
                <SelectDragIndicatorWrapper>
                  <SelectDragIndicator />
                </SelectDragIndicatorWrapper>
                <SelectItem label={editMode ? 'Preview' : 'Edit Comment'} value={'edit'} />
                <SelectItem label={'Delete Comment'} value={'delete'} />
              </SelectContent>
            </SelectPortal>
          </Select>
        ) : null}
      </View>
      <View className="flex-row">
        <View className="relative w-10 py-1">
          <View
            style={{ left: 17 }}
            className="absolute top-1 h-full w-0.5 rounded bg-outline-300"></View>
        </View>
        <View className="ml-4 flex-1">
          <View>
            {editMode ? (
              <View className="gap-2">
                <Textarea className="bg-white">
                  <TextareaInput
                    numberOfLines={2}
                    defaultValue={editContent}
                    onChange={(e) => {
                      setEditContent(e.nativeEvent.text);
                    }}
                    textAlignVertical="top"
                    placeholder="What are your thoughts?"
                    className="p-3"
                  />
                </Textarea>
                <Button
                  className="h-10 w-1/2 rounded-lg bg-warning-400"
                  onPress={handleEditComment}>
                  {/* {loading ? <ButtonSpinner color={'white'} /> : null} */}
                  <ButtonText className="text-md font-medium">Edit</ButtonText>
                </Button>
              </View>
            ) : comment?.deleted ? (
              <Text className="font-qs-medium  text-dark line-through">Deleted Content</Text>
            ) : (
              <Text className="font-qs-medium text-lg text-dark">{editContent}</Text>
            )}
          </View>
          <View className="flex-row items-center gap-2 py-2">
            <View className="flex-row items-center gap-2 ">
              <TouchableOpacity
                activeOpacity={0.75}
                style={
                  userVote == 1
                    ? {
                        backgroundColor: 'rgb(240 253 244) rgb(254 202 202)',
                        borderRadius: 100,
                        padding: 4,
                      }
                    : {}
                }
                onPress={() => {
                  if (voteLoading) return;
                  handleUpVote();
                }}>
                <Ionicons
                  name="chevron-up"
                  size={22}
                  color={userVote == 1 ? 'rgb(21 128 61) rgb(220 38 38)' : '#3d3d3d'}
                />
              </TouchableOpacity>
              <Text className="font-qs-semibold text-dark">
                {comment?.comment_reaction[0]?.sum || 0}
              </Text>
              <TouchableOpacity
                activeOpacity={0.75}
                style={
                  userVote == -1
                    ? { backgroundColor: 'rgb(254 202 202)', borderRadius: 100, padding: 4 }
                    : {}
                }
                onPress={() => {
                  if (voteLoading) return;
                  handleDownVote();
                }}>
                <Ionicons
                  name="chevron-down"
                  size={22}
                  color={userVote == -1 ? 'rgb(220 38 38)' : '#3d3d3d'}
                />
              </TouchableOpacity>
            </View>
            {!comment?.deleted ? (
              <View>
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => {
                    setReplyFormExpanded(!replyFormExpanded);
                  }}>
                  <Text className="font-qs-semibold tracking-tighter text-sky-400">Reply</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
          <Collapsible renderChildrenCollapsed={false} collapsed={!replyFormExpanded}>
            <View className="gap-2 pb-2">
              <Textarea className="bg-white">
                <TextareaInput
                  numberOfLines={5}
                  defaultValue={content}
                  onChange={(e) => {
                    setContent(e.nativeEvent.text);
                  }}
                  textAlignVertical="top"
                  placeholder="What are your thoughts?"
                  className="p-3"
                />
              </Textarea>
              <Button
                className="h-8 w-full rounded-lg bg-warning-400"
                onPress={async () => {
                  setRepliesExpanded(false);
                  let res = await handleAddComment({ parentId: comment.id, content });
                  if (res) {
                    setReplyFormExpanded(false);
                    setContent('');
                    setTimeout(() => {
                      setRepliesExpanded(true);
                    }, 200);
                  }
                }}>
                {/* {loading ? <ButtonSpinner color={'white'} /> : null} */}
                <ButtonText className="text-center text-sm font-medium">Add Reply</ButtonText>
              </Button>
            </View>
          </Collapsible>
          <View>
            {comment?.comment[0]?.count ? (
              <>
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => {
                    setRepliesExpanded(!repliesExpanded);
                  }}>
                  <Text className="font-qs-semibold tracking-tighter text-warning-400">
                    {repliesExpanded ? 'Hide' : 'Show'} Replies
                  </Text>
                </TouchableOpacity>
                <Collapsible renderChildrenCollapsed={false} collapsed={!repliesExpanded}>
                  <View className="pt-3">
                    <Comments
                      recipeId={comment.recipe_id}
                      parentId={comment.id}
                      refreshParent={refreshComments}
                    />
                  </View>
                </Collapsible>
              </>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
};

export default CommentItem;
