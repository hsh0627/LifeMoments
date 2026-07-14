import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Redirect } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import PixelText from '../../components/PixelText';

const schema = z.object({
  email: z.email('請輸入有效的 Email'),
  password: z.string().min(6, '密碼至少 6 個字元'),
});

type FormData = z.infer<typeof schema>;

export default function Login() {
  const session = useAuthStore((s) => s.session);
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  if (session) {
    return <Redirect href="/(tabs)/home" />;
  }

  const onSubmit = async (data: FormData) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (error) Alert.alert('登入失敗', error.message);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5EDD8' }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={{ flex: 1, paddingHorizontal: 32, justifyContent: 'center', gap: 12 }}>

          <PixelText size="lg" outlined color="#FFFFFF" style={{ marginBottom: 8 }}>歡迎回來</PixelText>
          <PixelText size="xs" color="#9C8570" style={{ marginBottom: 24 }}>登入你的帳號</PixelText>

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <View style={{ marginBottom: 12 }}>
                <TextInput
                  style={{ backgroundColor: '#FDF6E3', borderWidth: 2, borderColor: '#D9C9B0', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 14, fontFamily: 'DotGothic16_400Regular', fontSize: 16, color: '#3B2A1A' }}
                  placeholder="Email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={value}
                  onChangeText={onChange}
                />
                {errors.email && <PixelText size="xs" color="#C0392B" style={{ marginTop: 4 }}>{errors.email.message}</PixelText>}
              </View>
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <View style={{ marginBottom: 24 }}>
                <TextInput
                  style={{ backgroundColor: '#FDF6E3', borderWidth: 2, borderColor: '#D9C9B0', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 14, fontFamily: 'DotGothic16_400Regular', fontSize: 16, color: '#3B2A1A' }}
                  placeholder="密碼"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                />
                {errors.password && <PixelText size="xs" color="#C0392B" style={{ marginTop: 4 }}>{errors.password.message}</PixelText>}
              </View>
            )}
          />

          <TouchableOpacity
            style={{ backgroundColor: '#7C5C3E', paddingVertical: 16, borderRadius: 4, alignItems: 'center' }}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            <PixelText size="xs" outlined color="#FFFFFF">{isSubmitting ? '登入中...' : '[ 登入 ]'}</PixelText>
          </TouchableOpacity>

          <TouchableOpacity style={{ paddingVertical: 12, alignItems: 'center' }} onPress={() => router.push('/(auth)/register')}>
            <PixelText size="xs" color="#9C8570">還沒有帳號？立即註冊</PixelText>
          </TouchableOpacity>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
