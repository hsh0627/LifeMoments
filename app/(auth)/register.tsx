import { View, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '../../lib/supabase';
import PixelText from '../../components/PixelText';

const inputStyle = {
  backgroundColor: '#FDF6E3',
  borderWidth: 2,
  borderColor: '#D9C9B0',
  borderRadius: 8,
  paddingHorizontal: 16,
  paddingVertical: 14,
  fontFamily: 'DotGothic16_400Regular',
  fontSize: 16,
  color: '#3B2A1A',
};

const schema = z.object({
  displayName: z.string().min(2, '暱稱至少 2 個字元'),
  email: z.email('請輸入有效的 Email'),
  password: z.string().min(6, '密碼至少 6 個字元'),
});

type FormData = z.infer<typeof schema>;

export default function Register() {
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { display_name: data.displayName } },
    });
    if (error) {
      Alert.alert('註冊失敗', error.message);
    } else {
      Alert.alert('註冊成功', '請檢查你的 Email 以完成驗證', [
        { text: '好的', onPress: () => router.replace('/(auth)/login') },
      ]);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5EDD8' }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={{ flex: 1, paddingHorizontal: 32, justifyContent: 'center', gap: 12 }}>

          <PixelText size="lg" outlined color="#FFFFFF" style={{ marginBottom: 8 }}>建立帳號</PixelText>
          <PixelText size="xs" color="#9C8570" style={{ marginBottom: 24 }}>開始你的冒險旅程</PixelText>

          <Controller
            control={control}
            name="displayName"
            render={({ field: { onChange, value } }) => (
              <View style={{ marginBottom: 12 }}>
                <TextInput style={inputStyle} placeholder="你的暱稱" value={value} onChangeText={onChange} />
                {errors.displayName && <PixelText size="xs" color="#C0392B" style={{ marginTop: 4 }}>{errors.displayName.message}</PixelText>}
              </View>
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <View style={{ marginBottom: 12 }}>
                <TextInput style={inputStyle} placeholder="Email" keyboardType="email-address" autoCapitalize="none" value={value} onChangeText={onChange} />
                {errors.email && <PixelText size="xs" color="#C0392B" style={{ marginTop: 4 }}>{errors.email.message}</PixelText>}
              </View>
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <View style={{ marginBottom: 24 }}>
                <TextInput style={inputStyle} placeholder="密碼（至少 6 位）" secureTextEntry value={value} onChangeText={onChange} />
                {errors.password && <PixelText size="xs" color="#C0392B" style={{ marginTop: 4 }}>{errors.password.message}</PixelText>}
              </View>
            )}
          />

          <TouchableOpacity
            style={{ backgroundColor: '#7C5C3E', paddingVertical: 16, borderRadius: 4, alignItems: 'center' }}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            <PixelText size="xs" outlined color="#FFFFFF">{isSubmitting ? '建立中...' : '[ 建立帳號 ]'}</PixelText>
          </TouchableOpacity>

          <TouchableOpacity style={{ paddingVertical: 12, alignItems: 'center' }} onPress={() => router.back()}>
            <PixelText size="xs" color="#9C8570">已有帳號？登入</PixelText>
          </TouchableOpacity>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
