import React, { useCallback, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { supabase } from '~/utils/supabase';
import { useGlobalContext } from '~/context/GlobalProvider';

import { Button, ButtonSpinner, ButtonText } from './ui/button';
import { Textarea, TextareaInput } from './ui/textarea';
import CommentItem from './CommentItem';
import useCustomToast from './useCustomToast';

const Comments = ({ recipeId, parentId = null, refreshParent = () => {} }: any) => {
  const [comments, setComments] = useState<any[]>([]);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const { session, ifLight } = useGlobalContext();

  const toast = useCustomToast();

  useFocusEffect(
    useCallback(() => {
      console.log('focused');
      refreshComments();
    }, [])
  );

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('comment')
      .select('*, comment(count), comment_reaction(reaction.sum()), profile(*)')
      .eq('recipe_id', recipeId)
      .is('parent_id', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.log('comment error', error);
    }
    let tmp = [...data!];
    tmp.sort((a, b) => b.comment_reaction[0].sum - a.comment_reaction[0].sum);
    setComments(tmp);
  };

  const fetchReplies = async () => {
    const { data, error } = await supabase
      .from('comment')
      .select('*, comment(count), comment_reaction(reaction.sum()), profile(*)')
      .eq('recipe_id', recipeId)
      .eq('parent_id', parentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.log('replies error', error);
    }
    if (data?.length == 0) {
      refreshParent();
    }
    let tmp = [...data!];
    tmp.sort((a, b) => b.comment_reaction[0].sum - a.comment_reaction[0].sum);
    setComments(tmp);
  };

  const refreshComments = () => {
    console.log('refresing comments');
    if (parentId == null) {
      fetchComments();
    } else {
      fetchReplies();
    }
  };

  const handleAddComment = async ({ parentId = null, content }: any) => {
    if (!loading) {
      setLoading(true);

      content = content.trim();
      if (content.length > 0) {
        const { error } = await supabase.from('comment').insert({
          recipe_id: recipeId,
          parent_id: parentId,
          content,
          owner_id: session?.user.id,
        });

        if (error) {
          console.log('comment error', error);
          return false;
        }

        refreshComments();
        setLoading(false);
        setContent('');
        return true;
      } else {
        toast.warning('Comment cannot be empty');
        setLoading(false);
        return false;
      }
    }
  };

  return (
    <View>
      {parentId == null ? (
        <View className="mb-4 gap-4">
          <Textarea>
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
            className="h-10 w-1/2 rounded-lg bg-info-500"
            onPress={() => {
              handleAddComment({ content });
            }}>
            {/* {loading ? <ButtonSpinner color={'white'} /> : null} */}
            <ButtonText className="text-md font-medium text-info-50">Add Comment</ButtonText>
          </Button>
        </View>
      ) : null}
      {comments?.length > 0 ? (
        comments?.map((comment: any) => {
          return (
            <CommentItem
              key={comment.id}
              comment={comment}
              refreshComments={refreshComments}
              handleAddComment={handleAddComment}
            />
          );
        })
      ) : parentId ? (
        <View>
          <ButtonSpinner color={'black'} />
        </View>
      ) : (
        <View className="items-center py-8">
          <Ionicons name="logo-snapchat" size={24} color={ifLight('#3d3d3d', 'rgb(122 124 149)')} />
          <Text className="font-qs-medium text-lg text-dark">No comments yet.</Text>
        </View>
      )}
    </View>
  );
};

export default Comments;
