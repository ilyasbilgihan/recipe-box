import { View, Text, Image } from 'react-native';
import React, { useState } from 'react';
import Collapsible from 'react-native-collapsible';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '~/utils/supabase';
import { useGlobalContext } from '~/context/GlobalProvider';
import Comments from './Comments';
import { Button, ButtonText } from './ui/button';
import { Textarea, TextareaInput } from './ui/textarea';

const CommentItem = ({ comment, refreshComments, handleAddComment }: any) => {
  const [repliesExpanded, setRepliesExpanded] = useState(false);
  const [replyFormExpanded, setReplyFormExpanded] = useState(false);
  const [voteLoading, setVoteLoading] = useState(false);
  const [userVote, setUserVote] = useState(0);
  const [content, setContent] = useState('');

  const { session } = useGlobalContext();

  const handleDownVote = async () => {
    setVoteLoading(true);
    console.log('try downvote');
    const currentVote = await checkVote();

    if (currentVote == -1) {
      // remove vote
      await removeVote();
    } else {
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

    if (currentVote == 1) {
      // remove vote
      await removeVote();
    } else {
      console.log('downvote');
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

  return (
    <View key={comment.id}>
      <View className=" flex-row items-center gap-4">
        <Image source={{ uri: comment?.profile?.profile_image }} className="h-10 w-10 rounded-md" />
        <Text className="font-qs-bold text-lg text-dark">
          {comment?.profile?.name || '@' + comment?.profile?.username}
        </Text>
      </View>
      <View className="flex-row">
        <View className="relative w-10 py-1">
          <View
            style={{ left: 17 }}
            className="absolute top-1 h-full w-0.5 rounded bg-outline-300"></View>
        </View>
        <View className="flex-1 px-4 pb-2">
          <View>
            <Text className="font-qs-medium text-lg text-dark">{comment?.content}</Text>
          </View>
          <View className="flex-row gap-2">
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
            <View>
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => {
                  setReplyFormExpanded(!replyFormExpanded);
                }}>
                <Text className="font-qs-semibold tracking-tighter text-sky-400">Reply</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View>
            <Collapsible renderChildrenCollapsed={false} collapsed={!replyFormExpanded}>
              <View className="gap-2 pt-3">
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
                  className="h-10 w-1/2 rounded-lg bg-warning-400"
                  onPress={async () => {
                    await handleAddComment({ parentId: comment.id, content });
                    setReplyFormExpanded(false);
                    setRepliesExpanded(true);
                    setContent('');
                  }}>
                  {/* {loading ? <ButtonSpinner color={'white'} /> : null} */}
                  <ButtonText className="text-md font-medium">Add Reply</ButtonText>
                </Button>
              </View>
            </Collapsible>
            {comment?.comment[0]?.count > 0 ? (
              <>
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => {
                    setRepliesExpanded(!repliesExpanded);
                  }}>
                  <Text className="font-qs-semibold tracking-tighter text-warning-400">
                    Show Replies
                  </Text>
                </TouchableOpacity>
                <Collapsible renderChildrenCollapsed={false} collapsed={!repliesExpanded}>
                  <View className="pt-3">
                    <Comments recipeId={comment.recipe_id} parentId={comment.id} />
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
