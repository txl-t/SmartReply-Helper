import {ScrollView, Text, View} from '@tarojs/components'
import Taro, {useDidShow} from '@tarojs/taro'
import {useCallback, useState} from 'react'

type ThemeMode = 'auto' | 'light' | 'dark'

export default function Profile() {
  const [themeMode, setThemeMode] = useState<ThemeMode>('auto')

  useDidShow(() => {
    // 加载主题设置
    const savedTheme = Taro.getStorageSync('theme_mode') || 'auto'
    setThemeMode(savedTheme)
    applyTheme(savedTheme)
  })

  // 应用主题
  const applyTheme = useCallback((mode: ThemeMode) => {
    const systemInfo = Taro.getSystemInfoSync()
    let isDark = false

    if (mode === 'auto') {
      isDark = systemInfo.theme === 'dark'
    } else if (mode === 'dark') {
      isDark = true
    }

    // 切换暗黑模式
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [])

  // 切换主题
  const handleThemeChange = useCallback(
    (mode: ThemeMode) => {
      setThemeMode(mode)
      Taro.setStorageSync('theme_mode', mode)
      applyTheme(mode)
      Taro.showToast({
        title: '主题已切换',
        icon: 'success',
        duration: 1500
      })
    },
    [applyTheme]
  )

  // 查看协议
  const handleViewAgreement = useCallback((type: 'user' | 'privacy') => {
    const title = type === 'user' ? '用户协议' : '隐私政策'
    const content =
      type === 'user'
        ? '欢迎使用智能回复助手。本应用致力于为用户提供智能回复生成服务。使用本应用即表示您同意遵守相关使用规范。'
        : '我们重视您的隐私保护。本应用仅在本地存储您的使用记录，不会上传至服务器。生成回复时会调用AI服务，但不会保存您的个人信息。'

    Taro.showModal({
      title,
      content,
      showCancel: false,
      confirmText: '我知道了'
    })
  }, [])

  // 关于我们
  const handleAbout = useCallback(() => {
    Taro.showModal({
      title: '关于我们',
      content: '智能回复助手 v1.0.0\n\n一款轻量级智能回复助手，帮助用户快速生成多风格文字回复。\n\n© 2026 智能回复助手',
      showCancel: false
    })
  }, [])

  // 清除缓存
  const handleClearCache = useCallback(() => {
    Taro.showModal({
      title: '清除缓存',
      content: '确定要清除所有缓存数据吗？这不会删除您的历史记录。',
      success: (res) => {
        if (res.confirm) {
          // 这里可以清除一些临时缓存，但保留历史记录
          Taro.showToast({
            title: '缓存已清除',
            icon: 'success'
          })
        }
      }
    })
  }, [])

  const themeModes: {value: ThemeMode; label: string}[] = [
    {value: 'auto', label: '跟随系统'},
    {value: 'light', label: '浅色模式'},
    {value: 'dark', label: '深色模式'}
  ]

  return (
    <View className="min-h-screen bg-gradient-bg">
      <ScrollView scrollY className="h-screen" style={{background: 'transparent'}}>
        <View className="p-4 pb-24">
          {/* 头部 */}
          <View className="mb-6">
            <View className="flex flex-col items-center py-8">
              <View className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center mb-4 shadow-elegant-lg">
                <View className="i-mdi-robot text-5xl text-primary-foreground" />
              </View>
              <Text className="text-xl font-bold text-foreground block mb-1">智能回复助手</Text>
              <Text className="text-sm text-muted-foreground block">让沟通更轻松</Text>
            </View>
          </View>

          {/* 主题设置 */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-muted-foreground block mb-3 break-keep">外观设置</Text>
            <View className="bg-card rounded-xl overflow-hidden shadow-elegant-sm">
              <View className="p-4 border-b border-border">
                <View className="flex items-center gap-3">
                  <View className="i-mdi-theme-light-dark text-xl text-primary" />
                  <Text className="text-base text-foreground break-keep flex-1">主题模式</Text>
                </View>
              </View>
              <View className="p-4">
                <View className="flex gap-2">
                  {themeModes.map((mode) => (
                    <View
                      key={mode.value}
                      className={`flex-1 text-center py-2 rounded-lg transition-all ${
                        themeMode === mode.value
                          ? 'bg-gradient-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground'
                      }`}
                      onClick={() => handleThemeChange(mode.value)}>
                      <Text className="text-sm font-medium break-keep">{mode.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* 功能设置 */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-muted-foreground block mb-3 break-keep">功能设置</Text>
            <View className="bg-card rounded-xl overflow-hidden shadow-elegant-sm">
              <View className="p-4 border-b border-border flex items-center justify-between" onClick={handleClearCache}>
                <View className="flex items-center gap-3">
                  <View className="i-mdi-delete-sweep text-xl text-primary" />
                  <Text className="text-base text-foreground break-keep">清除缓存</Text>
                </View>
                <View className="i-mdi-chevron-right text-xl text-muted-foreground" />
              </View>
            </View>
          </View>

          {/* 关于 */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-muted-foreground block mb-3 break-keep">关于</Text>
            <View className="bg-card rounded-xl overflow-hidden shadow-elegant-sm">
              <View
                className="p-4 border-b border-border flex items-center justify-between"
                onClick={() => handleViewAgreement('user')}>
                <View className="flex items-center gap-3">
                  <View className="i-mdi-file-document text-xl text-primary" />
                  <Text className="text-base text-foreground break-keep">用户协议</Text>
                </View>
                <View className="i-mdi-chevron-right text-xl text-muted-foreground" />
              </View>
              <View
                className="p-4 border-b border-border flex items-center justify-between"
                onClick={() => handleViewAgreement('privacy')}>
                <View className="flex items-center gap-3">
                  <View className="i-mdi-shield-lock text-xl text-primary" />
                  <Text className="text-base text-foreground break-keep">隐私政策</Text>
                </View>
                <View className="i-mdi-chevron-right text-xl text-muted-foreground" />
              </View>
              <View className="p-4 flex items-center justify-between" onClick={handleAbout}>
                <View className="flex items-center gap-3">
                  <View className="i-mdi-information text-xl text-primary" />
                  <Text className="text-base text-foreground break-keep">关于我们</Text>
                </View>
                <View className="i-mdi-chevron-right text-xl text-muted-foreground" />
              </View>
            </View>
          </View>

          {/* 版权信息 */}
          <View className="text-center py-6">
            <Text className="text-xs text-muted-foreground block">© 2026 智能回复助手</Text>
            <Text className="text-xs text-muted-foreground block mt-1">Version 1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
