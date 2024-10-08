import { View, Text, Dimensions } from 'react-native';
import React from 'react';
import { Toast, ToastDescription, ToastTitle, useToast } from './ui/toast';
import { Ionicons } from '@expo/vector-icons';
import { Button, ButtonGroup, ButtonText } from './ui/button';
import { useGlobalContext } from '~/context/GlobalProvider';
import { useTranslation } from 'react-i18next';

const ToastContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <View
      style={{
        position: 'relative',
        height: Dimensions.get('screen').height,
        width: Dimensions.get('screen').width,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: 28,
        paddingTop: 40,
      }}>
      {children}
    </View>
  );
};

const useCustomToast = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const success = (message: string, duration = 5000) => {
    toast.show({
      placement: 'top',
      duration,
      render: ({ id }) => {
        const toastId = 'toast-' + id;
        return (
          <ToastContainer>
            <Toast
              nativeID={toastId}
              className="w-full flex-row items-center gap-4 bg-success-500 px-5 py-3 shadow-soft-1">
              <Ionicons name="checkmark-circle" size={24} color={'rgb(202 255 232)'} />
              <View
                style={{ borderLeftWidth: 1, paddingLeft: 12 }}
                className="flex-1 border-success-50">
                <ToastDescription className=" font-qs-semibold text-success-50" size="sm">
                  {message}
                </ToastDescription>
              </View>
            </Toast>
          </ToastContainer>
        );
      },
    });
  };

  const error = (message: string, duration = 5000) => {
    toast.show({
      placement: 'top',
      duration,
      render: ({ id }) => {
        const toastId = 'toast-' + id;
        return (
          <ToastContainer>
            <Toast
              nativeID={toastId}
              className="w-full flex-row items-center gap-4 bg-error-500 px-5 py-3 shadow-soft-1">
              <Ionicons name="close-circle" size={24} color={'rgb(254 226 226)'} />
              <View
                style={{ borderLeftWidth: 1, paddingLeft: 12 }}
                className="flex-1 border-error-50">
                <ToastDescription className=" font-qs-semibold text-error-50" size="sm">
                  {message}
                </ToastDescription>
              </View>
            </Toast>
          </ToastContainer>
        );
      },
    });
  };

  const warning = (message: string, duration = 5000) => {
    toast.show({
      placement: 'top',
      duration,
      render: ({ id }) => {
        const toastId = 'toast-' + id;
        return (
          <ToastContainer>
            <Toast
              nativeID={toastId}
              className="w-full flex-row items-center gap-4 bg-warning-400 px-5 py-3 shadow-soft-1">
              <Ionicons name="alert-circle" size={24} color={'rgb(255 249 245)'} />
              <View
                style={{ borderLeftWidth: 1, paddingLeft: 12 }}
                className="flex-1 border-warning-50">
                <ToastDescription className=" font-qs-semibold text-warning-50" size="sm">
                  {message}
                </ToastDescription>
              </View>
            </Toast>
          </ToastContainer>
        );
      },
    });
  };

  const [toastId, setToastId] = React.useState(0);
  const confirm = ({
    title,
    message,
    icon,
    handler,
  }: {
    title: string;
    message: string;
    icon: any;
    handler: () => void;
  }) => {
    if (!toast.isActive('' + toastId)) {
      confirmToast({ title, message, icon, handler });
    }
  };

  const dismisAll = () => {
    toast.closeAll();
  };

  const confirmToast = ({
    title,
    message,
    icon,
    handler,
  }: {
    title: string;
    message: string;
    icon: any;
    handler: () => void;
  }) => {
    const newId = Math.random();
    setToastId(newId);
    toast.show({
      id: '' + newId,
      placement: 'top',
      duration: 10000,
      render: ({ id }) => {
        const uniqueToastId = 'toast-' + id;
        return (
          <View
            style={{
              position: 'relative',
              height: Dimensions.get('screen').height,
              width: Dimensions.get('screen').width,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 28,
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}>
            <Toast
              nativeID={uniqueToastId}
              className="w-full max-w-[386px] flex-row gap-4 bg-light p-4 shadow-soft-2">
              <View className="hidden h-11 w-11 items-center justify-center min-[400px]:flex">
                {icon}
              </View>
              <View className="gap-4">
                <View className="gap-2">
                  <ToastTitle className="font-semibold text-typography-900">{title}</ToastTitle>
                  <ToastDescription className="text-typography-700">{message}</ToastDescription>
                </View>
                <ButtonGroup className="flex-row gap-3">
                  <Button
                    action="secondary"
                    variant="outline"
                    size="sm"
                    className="flex-grow"
                    onPress={() => {
                      toast.close(id);
                    }}>
                    <ButtonText>{t('cancel')}</ButtonText>
                  </Button>
                  <Button
                    size="sm"
                    className="flex-grow"
                    onPress={() => {
                      toast.close(id);
                      handler();
                    }}>
                    <ButtonText>{t('confirm')}</ButtonText>
                  </Button>
                </ButtonGroup>
              </View>
            </Toast>
          </View>
        );
      },
    });
  };

  return { success, error, warning, confirm, dismisAll };
};
export default useCustomToast;
