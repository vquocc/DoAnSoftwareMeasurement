import React, { useEffect, useState } from 'react'
import { Row, Col, InputNumber, Typography, Space, Button, Divider } from 'antd'

const { Text } = Typography

const gscList = [
  { label: 'F1. Data Communications (Giao dịch dữ liệu)' },
  { label: 'F2. Distributed Data Processing (Xử lý dữ liệu phân tán)' },
  { label: 'F3. Performance (Hiệu suất)' },
  { label: 'F4. Heavily Used Configuration (Tần suất sử dụng)' },
  { label: 'F5. Transaction Rate (Tốc độ giao dịch)' },
  { label: 'F6. On-line Data Entry (Nhập liệu trực tuyến)' },
  { label: 'F7. End-User Efficiency (Hiệu quả người dùng cuối)' },
  { label: 'F8. On-line Update (Cập nhật trực tuyến)' },
  { label: 'F9. Complex Processing (Xử lý phức tạp)' },
  { label: 'F10. Reusability (Tái sử dụng mã)' },
  { label: 'F11. Installation Ease (Dễ cài đặt)' },
  { label: 'F12. Operational Ease (Dễ vận hành)' },
  { label: 'F13. Multiple Sites (Đa người dùng / nhiều nơi)' },
  { label: 'F14. Facilitate Change (Hỗ trợ thay đổi)' }
]

function GSCForm({ onTotalChange, onGscValues, vafAI }) {
  const [values, setValues] = useState(Array(14).fill(0))
  const [backupValues, setBackupValues] = useState(Array(14).fill(0))
  const [setValue, setSetValue] = useState(0)

  useEffect(() => {
    if (vafAI && Object.keys(vafAI).length > 0) {
      const mappedValues = [
        vafAI.DataCommunications ?? 0,
        vafAI.DistributedDataProcessing ?? 0,
        vafAI.Performance ?? 0,
        vafAI.HeavilyUsedConfiguration ?? 0,
        vafAI.TransactionRate ?? 0,
        vafAI.On_lineDataEntry ?? 0,
        vafAI.EndUserEfficiency ?? 0,
        vafAI.On_lineUpdate ?? 0,
        vafAI.ComplexProcessing ?? 0,
        vafAI.Reusability ?? 0,
        vafAI.InstallationEase ?? 0,
        vafAI.OperationalEase ?? 0,
        vafAI.MultipleSites ?? 0,
        vafAI.FacilitateChange ?? 0
      ]
      setValues(mappedValues)
    }
  }, [vafAI])

  useEffect(() => {
    const total = values.reduce((sum, v) => sum + v, 0)
    onTotalChange(total)
    onGscValues && onGscValues(values)
  }, [values])

  const handleChange = (index, value) => {
    const newValues = [...values]
    newValues[index] = value || 0
    setValues(newValues)
  }

  const handleSetAll = () => {
    if (setValue >= 0 && setValue <= 5) {
      setBackupValues([...values])
      setValues(Array(14).fill(setValue))
    }
  }

  const handleCancel = () => {
    setValues([...backupValues])
  }

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Text strong>Set tất cả VAF thành:</Text>
        <InputNumber
          min={0}
          max={5}
          value={setValue}
          onChange={(val) => setSetValue(val || 0)}
          style={{ width: 80 }}
        />
        <Button type="primary" onClick={handleSetAll}>Set All</Button>
        <Button onClick={handleCancel}>Cancel</Button>
      </Space>

      <Divider style={{ margin: '12px 0' }} />

      <Row gutter={[24, 16]}>
        {gscList.map((item, index) => (
          <Col span={12} key={index}>
            <Text>{item.label}</Text>
            <InputNumber
              min={0}
              max={5}
              style={{ width: '100%', marginTop: 4 }}
              value={values[index]}
              onChange={(val) => handleChange(index, val)}
            />
          </Col>
        ))}
      </Row>
    </>
  )
}

export default GSCForm
