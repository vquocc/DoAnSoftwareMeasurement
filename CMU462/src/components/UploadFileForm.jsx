import React, { useState } from 'react';
import { Upload, Button, Card, message, Spin } from 'antd';
import { UploadOutlined, CheckCircleTwoTone } from '@ant-design/icons';

function UploadFileForm({ FP, VAF }) {
	const [status, setStatus] = useState('idle') // idle | loading | success

	const handleFileUpload = async ({ file }) => {
		try {
			setStatus('loading');

			const formData = new FormData();
			formData.append('file', file);

			const response = await fetch('http://localhost:5000/analyze', {
				method: 'POST',
				body: formData
			});

			if (!response.ok) throw new Error('Upload thất bại');

			const result = await response.json();
			console.log(result.parsedJson);
			if (FP) FP(result.parsedJson.FunctionCounts);
			if (VAF) VAF(result.parsedJson.VAF);

			setStatus('success');

			// Sau 3 giây, tự động trở lại trạng thái idle
			setTimeout(() => setStatus('idle'), 3000);
		} catch (err) {
			console.error(err);
			alert('Có lỗi khi phân tích tài liệu.');
			setStatus('idle');
		}
	};

	return (
		<Card title="Tải tài liệu để phân tích tự động bằng AI" style={{ marginBottom: 24 }}>
			{status === 'loading' ? (
				<Spin tip="Đang phân tích tài liệu..." size="large">
					<div style={{ minHeight: 80 }} />
				</Spin>
			) : status === 'success' ? (
				<div style={{ textAlign: 'center', padding: 20 }}>
					<CheckCircleTwoTone twoToneColor="#52c41a" style={{ fontSize: 48 }} />
					<p style={{ marginTop: 12, color: '#52c41a', fontWeight: 500 }}>Phân tích thành công!</p>
				</div>
			) : (
				<>
					<Upload
						accept=".pdf,.docx,.png,.jpg,.jpeg"
						customRequest={handleFileUpload}
						showUploadList={false}
						disabled={status === 'loading'}
					>
						<Button icon={<UploadOutlined />} type="primary">
							Chọn file PDF hoặc Word
						</Button>
					</Upload>
					<p style={{ marginTop: 10, color: '#666' }}>
						Sau khi chọn file, AI sẽ phân tích và tự động điền EI, EO, ILF,...
					</p>
				</>
			)}
		</Card>
	);
}

export default UploadFileForm;
