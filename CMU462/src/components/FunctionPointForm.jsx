import React, { useEffect, useState } from 'react'
import { Table, InputNumber, Tag, Button, Modal, Image } from 'antd'

// Ma trận xác định độ phức tạp dựa trên số lượng DET và FTR
const complexityMatrix = {
  EI: [['Low', 'Low', 'Average'], ['Low', 'Average', 'High'], ['Average', 'High', 'High']],
  EO: [['Low', 'Low', 'Average'], ['Low', 'Average', 'High'], ['Average', 'High', 'High']],
  EQ: [['Low', 'Low', 'Average'], ['Low', 'Average', 'High'], ['Average', 'High', 'High']],
  ILF: [['Low', 'Low', 'Average'], ['Low', 'Average', 'High'], ['Average', 'High', 'High']],
  EIF: [['Low', 'Low', 'Average'], ['Low', 'Average', 'High'], ['Average', 'High', 'High']]
}

const weights = {
  EI: { Low: 3, Average: 4, High: 6 },
  EO: { Low: 4, Average: 5, High: 7 },
  EQ: { Low: 3, Average: 4, High: 6 },
  ILF: { Low: 7, Average: 10, High: 15 },
  EIF: { Low: 5, Average: 7, High: 10 }
}

const components = ['EI', 'EO', 'EQ', 'ILF', 'EIF']

function getComplexity(type, det, ftr) {
  const detIdx = det <= 4 ? 0 : det <= 15 ? 1 : 2
  const ftrIdx = ftr <= 1 ? 0 : ftr === 2 ? 1 : 2
  return complexityMatrix[type][ftrIdx][detIdx]
}

function FunctionPointForm({ onUfpChange, onDataChange, fpAI }) {
  const [data, setData] = useState(
    components.map((type) => ({
      key: type,
      type,
      det: 1,
      ftr: 1,
      complexity: 'Low',
      ufp: 0
    }))
  )

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedType, setSelectedType] = useState('')

  // ✅ Áp dụng dữ liệu AI khi có
  useEffect(() => {
    if (fpAI && Object.keys(fpAI).length > 0) {
      const updated = components.map((type) => {
        const det = fpAI[type]?.det ?? 1
        const ftr = fpAI[type]?.ftr ?? 1
        const complexity = getComplexity(type, det, ftr)
        const ufp = weights[type][complexity] || 0
        return { key: type, type, det, ftr, complexity, ufp }
      })
      setData(updated)
      onDataChange && onDataChange(updated)
      const total = updated.reduce((sum, item) => sum + item.ufp, 0)
      onUfpChange && onUfpChange(total)
    }
  }, [fpAI])

  // ✅ Tính toán lại khi DET hoặc FTR thay đổi thủ công
  useEffect(() => {
    const updatedData = data.map((item) => {
      const complexity = getComplexity(item.type, item.det, item.ftr)
      const ufp = weights[item.type][complexity] || 0
      return { ...item, complexity, ufp }
    })

    setData(updatedData)
    onDataChange && onDataChange(updatedData)
    const total = updatedData.reduce((sum, item) => sum + item.ufp, 0)
    onUfpChange && onUfpChange(total)
  }, [data.map((d) => d.det + '-' + d.ftr).join()])

  const handleChange = (key, field, value) => {
    setData((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, [field]: value || 1 } : item
      )
    )
  }

  const openImageModal = (type) => {
    setSelectedType(type)
    setModalOpen(true)
  }

  const columns = [
    {
      title: 'Component',
      dataIndex: 'type',
      width: 160,
      render: (value) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{value}</span>
          <Button size="small" onClick={() => openImageModal(value)}>
            Xem hình
          </Button>
        </div>
      )
    },
    {
      title: 'DET',
      dataIndex: 'det',
      render: (value, record) => (
        <InputNumber min={1} value={value} onChange={(val) => handleChange(record.key, 'det', val)} />
      )
    },
    {
      title: 'FTR',
      dataIndex: 'ftr',
      render: (value, record) => (
        <InputNumber min={1} value={value} onChange={(val) => handleChange(record.key, 'ftr', val)} />
      )
    },
    {
      title: 'Complexity',
      dataIndex: 'complexity',
      render: (value) => {
        const color = value === 'Low' ? 'green' : value === 'Average' ? 'orange' : 'red'
        return <Tag color={color}>{value}</Tag>
      }
    },
    {
      title: 'UFP',
      dataIndex: 'ufp'
    }
  ]

  return (
    <>
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        bordered
        size="middle"
        style={{ marginTop: 16 }}
      />

      <Modal
        title={`Hình minh họa cho ${selectedType}`}
        open={modalOpen}
        footer={null}
        onCancel={() => setModalOpen(false)}
      >
        <Image
          src={`/images/${selectedType}.png`}
          alt={`Hình ảnh của ${selectedType}`}
          width="100%"
        />
      </Modal>
    </>
  )
}

export default FunctionPointForm
