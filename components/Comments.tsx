import { View, Text, Alert } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '~/utils/supabase';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, ButtonSpinner, ButtonText } from './ui/button';
import CommentItem from './CommentItem';
import { Textarea, TextareaInput } from './ui/textarea';
import { useGlobalContext } from '~/context/GlobalProvider';

const Comments = ({ recipeId, parentId = null, refreshParent = () => {} }: any) => {
  const [comments, setComments] = useState<any[]>([]);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const { session } = useGlobalContext();

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

    setComments(data!);
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
    setComments(data!);
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
        Alert.alert('Comment cannot be empty');
        setLoading(false);
        return false;
      }
    }
  };

  return (
    <View>
      {parentId == null ? (
        <View className="mb-4 gap-4">
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
            className="h-10 w-1/2 rounded-lg bg-sky-500"
            onPress={() => {
              handleAddComment({ content });
            }}>
            {/* {loading ? <ButtonSpinner color={'white'} /> : null} */}
            <ButtonText className="text-md font-medium">Add Comment</ButtonText>
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
          <Ionicons name="logo-snapchat" size={24} color={'#3d3d3d'} />
          <Text className="font-qs-medium text-lg">No comments yet.</Text>
        </View>
      )}
    </View>
  );
};

export default Comments;
