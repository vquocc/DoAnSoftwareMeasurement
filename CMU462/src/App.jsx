import React, { useState } from 'react'
import { Layout, Typography, Divider, Card, Space, Button, Modal, Image } from 'antd'
import FunctionPointForm from './components/FunctionPointForm'
import GSCForm from './components/GSCForm'
import './App.css';
import UploadFileForm from './components/UploadFileForm';

const { Header, Content } = Layout
const { Title } = Typography


const vafList = [
  { label: 'Data Communications (Giao dịch dữ liệu)' },
  { label: 'Distributed Data Processing (Xử lý dữ liệu phân tán)' },
  { label: 'Performance (Hiệu suất)' },
  { label: 'Heavily Used Configuration (Tần suất sử dụng)' },
  { label: 'Transaction Rate (Tốc độ giao dịch)' },
  { label: 'On-line Data Entry (Nhập liệu trực tuyến)' },
  { label: 'End-User Efficiency (Hiệu quả người dùng cuối)' },
  { label: 'On-line Update (Cập nhật trực tuyến)' },
  { label: 'Complex Processing (Xử lý phức tạp)' },
  { label: 'Reusability (Tái sử dụng mã)' },
  { label: 'Installation Ease (Dễ cài đặt)' },
  { label: 'Operational Ease (Dễ vận hành)' },
  { label: 'Multiple Sites (Đa người dùng / nhiều nơi)' },
  { label: 'Facilitate Change (Hỗ trợ thay đổi)' }
]


function App() {
  const [ufp, setUfp] = useState(0)
  const [gscTotal, setGscTotal] = useState(0)
  const [componentData, setComponentData] = useState([])
  const [gscData, setGscData] = useState([])
  const [showReport, setShowReport] = useState(false)
  const [selectedType, setSelectedType] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [fpAI, setfpAI] = useState({})
  const [vafAI, setvafAI] = useState({})
  const vaf = 0.65 + 0.01 * gscTotal
  const fp = (ufp * vaf).toFixed(2)

  const handleGenerateReport = () => {
    setShowReport(true)
  }


  return (
    <Layout style={{ minHeight: '100vh', padding: '24px' }}>
      <Header style={{ backgroundColor: 'transparent', padding: '16px 0', textAlign: 'center' }}>
        <Title
          level={2}
          style={{
            margin: 0,
            fontSize: '28px',
            fontWeight: 600,
            color: '#2c3e50',
            fontFamily: 'Segoe UI, Roboto, sans-serif'
          }}
        >
          Function Point Calculator
        </Title>
      </Header>

      <Content style={{ marginTop: '24px' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <UploadFileForm FP = {setfpAI} VAF = {setvafAI}/>
          <Card title="Step 1: Unadjusted FP Count (UFC)">
            <FunctionPointForm onUfpChange={setUfp} onDataChange={setComponentData} fpAI = {fpAI} />
          </Card>

          <Card title="Step 2: Value Adjustment Factor (VAF)">
            <GSCForm onTotalChange={setGscTotal} onGscValues={setGscData} vafAI = {vafAI}/>
          </Card>

          <Divider />

          <Card title="Final Result">
            <p><strong>UFP:</strong> {ufp}</p>
            <p><strong>VAF:</strong> {vaf.toFixed(2)}</p>
            <p><strong>Total Function Points (FP):</strong> <span style={{ color: 'green', fontWeight: 'bold' }}>{fp}</span></p>
            <Button type="primary" onClick={handleGenerateReport}>
              Xem Báo Cáo Tổng Quan
            </Button>
          </Card>

          <Button type="default" onClick={() => { setSelectedType('RE'); setModalOpen(true); }} style={{ position: 'absolute', top: 20, left: 20 }}>
            Requirement
          </Button>

        </Space>
      </Content>

      <Modal
        title={<span style={{ fontSize: 20, fontWeight: 600 }}>📊 Báo Cáo Tổng Quan</span>}
        open={showReport}
        onCancel={() => setShowReport(false)}
        onOk={() => setShowReport(false)}
        width={900}
        bodyStyle={{ fontSize: 16, lineHeight: 1.6 }}
      >
        <h3 style={{ fontWeight: '600', fontSize: 18, marginBottom: 12 }}>📌 1. Thông tin chức năng (EI, EO...)</h3>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginBottom: 24,
            border: '1px solid #ccc',
            textAlign: 'center',
          }}
        >
          <thead style={{ background: '#f5f5f5' }}>
            <tr>
              <th style={{ padding: '8px' }}>Loại</th>
              <th style={{ padding: '8px' }}>DET</th>
              <th style={{ padding: '8px' }}>FTR</th>
              <th style={{ padding: '8px' }}>Độ phức tạp</th>
              <th style={{ padding: '8px' }}>UFP</th>
            </tr>
          </thead>
          <tbody>
            {componentData.map((item) => (
              <tr key={item.type}>
                <td style={{ padding: '6px' }}>{item.type}</td>
                <td style={{ padding: '6px' }}>{item.det}</td>
                <td style={{ padding: '6px' }}>{item.ftr}</td>
                <td style={{ padding: '6px' }}>{item.complexity}</td>
                <td style={{ padding: '6px' }}>{item.ufp}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 style={{ fontWeight: '600', fontSize: 18, marginBottom: 12 }}>📌 2. VAF (14 Components)</h3>
        <ol style={{ marginLeft: 20, marginBottom: 20 }}>
          {vafList.map((item, index) => (
            <li key={index}>
              {item.label}: {gscData[index] !== undefined ? gscData[index] : 'Chưa nhập'}
            </li>
          ))}
        </ol>

        <div style={{ fontSize: 16 }}>
          <p><strong>Tổng VAF:</strong> {gscTotal}</p>
          <p><strong>VAF:</strong> {vaf.toFixed(2)}</p>
          <p>
            <strong>→ Tổng Function Points (FP):</strong>
            <span style={{ fontWeight: 'bold', fontSize: 18, color: '#2ecc71' }}>{fp}</span>
          </p>
        </div>
      </Modal>

      <Modal
        title={"Requirement"}
        open={modalOpen}
        footer={null}
        onCancel={() => setModalOpen(false)}
        width="auto"
        bodyStyle={{
          padding: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        style={{
          maxWidth: '95%',
          maxHeight: '95vh',
        }}
      >

        <Image
          src={`/images/${selectedType}.png`}
          alt={`Hình ảnh của ${selectedType}`}
          style={{
            width: '100%',
            maxHeight: '80vh',
            objectFit: 'contain',
          }}
        />
      </Modal>
    </Layout>
  )
}
export default App
