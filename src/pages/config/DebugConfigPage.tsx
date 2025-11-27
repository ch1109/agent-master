import { Bug, Zap, Clock, FileText, Eye, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Divider } from '@/components/ui/divider'
import { useAgentStore } from '@/stores/agentStore'

/**
 * 调试配置页面
 * 用于配置调试选项、模拟模式、日志级别等
 */
export function DebugConfigPage() {
  const { debugOptions, updateDebugOptions, resetConfig } = useAgentStore()

  const handleReset = () => {
    if (window.confirm('确定要重置所有配置吗？这将恢复默认设置。')) {
      resetConfig()
    }
  }

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <Bug className="w-5 h-5" />
              调试配置
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              配置调试选项和模拟模式，方便开发和测试
            </p>
          </div>
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="w-4 h-4" />
            重置配置
          </Button>
        </div>

        {/* AI 模式配置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-[var(--color-primary)]" />
              AI 模式配置
            </CardTitle>
            <CardDescription>
              控制 AI 响应模式，可以选择使用模拟数据或真实 AI 调用
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>使用模拟响应</Label>
                <p className="text-sm text-[var(--text-tertiary)]">
                  开启后将使用预设的模拟数据，无需真实的 API Key
                </p>
              </div>
              <Switch
                checked={debugOptions.useMockResponse}
                onCheckedChange={(checked) => updateDebugOptions({ useMockResponse: checked })}
              />
            </div>

            <Divider />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  模拟响应延迟 (毫秒)
                </Label>
                <p className="text-sm text-[var(--text-tertiary)]">
                  设置模拟响应的延迟时间，模拟真实 API 调用体验
                </p>
              </div>
              <Input
                type="number"
                value={debugOptions.mockDelay}
                onChange={(e) => updateDebugOptions({ mockDelay: parseInt(e.target.value) || 0 })}
                className="w-32"
                min={0}
                max={10000}
                step={100}
              />
            </div>
          </CardContent>
        </Card>

        {/* 调试选项 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[var(--color-primary)]" />
              调试选项
            </CardTitle>
            <CardDescription>
              配置调试模式和日志级别
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>启用调试模式</Label>
                <p className="text-sm text-[var(--text-tertiary)]">
                  开启后将显示更多调试信息
                </p>
              </div>
              <Switch
                checked={debugOptions.enabled}
                onCheckedChange={(checked) => updateDebugOptions({ enabled: checked })}
              />
            </div>

            <Divider />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>日志级别</Label>
                <p className="text-sm text-[var(--text-tertiary)]">
                  选择要输出的日志级别
                </p>
              </div>
              <Select
                value={debugOptions.logLevel}
                onValueChange={(value: 'debug' | 'info' | 'warn' | 'error') => 
                  updateDebugOptions({ logLevel: value })
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="debug">Debug</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warn">Warn</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Divider />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  显示请求详情
                </Label>
                <p className="text-sm text-[var(--text-tertiary)]">
                  在控制台显示完整的 API 请求信息
                </p>
              </div>
              <Switch
                checked={debugOptions.showRequestDetails}
                onCheckedChange={(checked) => updateDebugOptions({ showRequestDetails: checked })}
              />
            </div>

            <Divider />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  显示响应详情
                </Label>
                <p className="text-sm text-[var(--text-tertiary)]">
                  在控制台显示完整的 API 响应信息
                </p>
              </div>
              <Switch
                checked={debugOptions.showResponseDetails}
                onCheckedChange={(checked) => updateDebugOptions({ showResponseDetails: checked })}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DebugConfigPage

