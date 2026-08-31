import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { LabItem } from './DynamicTable';

// Tipos de datos para el PDF
export interface PatientData {
  patient_name: string;
  patient_document: string;
  patient_age: string;
  patient_gender: string;
  sample_date: string;
  sample_time: string;
  sample_type: string;
  doctor_name: string;
  report_number: string;
  observations: string;
}

export interface LabSettingsData {
  professional_name: string;
  professional_title: string;
  professional_id: string;
  signature_url?: string | null;
  stamp_url?: string | null;
}

interface LabPDFProps {
  patient: PatientData;
  items: LabItem[];
  settings: LabSettingsData;
}

// Estilos del PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1a1a1a',
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
    borderBottom: '1 solid #000',
    paddingBottom: 10,
    alignItems: 'center',
  },
  logoImage: {
    width: 140,
    height: 46,
    objectFit: 'contain',
    marginBottom: 8,
  },
  titleLab: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  titleApp: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  titleReport: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
    padding: 4,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    width: 100,
    fontWeight: 'bold',
  },
  value: {
    flex: 1,
  },
  table: {
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginTop: 10,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#f5f5f5',
  },
  tableColHeaderExamen: {
    width: '28%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#f5f5f5',
  },
  tableColHeaderResultado: {
    width: '12%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#f5f5f5',
  },
  tableCol: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableColExamen: {
    width: '28%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableColResultado: {
    width: '12%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCellHeader: {
    margin: 5,
    fontSize: 10,
    fontWeight: 'bold',
  },
  tableCell: {
    margin: 5,
    fontSize: 9,
  },
  bold: {
    fontWeight: 'bold',
  },
  alto: {
    color: '#d32f2f',
    fontWeight: 'bold',
  },
  bajo: {
    color: '#f57c00',
    fontWeight: 'bold',
  },
  observaciones: {
    marginTop: 10,
    minHeight: 40,
    padding: 8,
    border: '1 solid #bfbfbf',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
  },
  signatureContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 40,
    alignItems: 'flex-end',
  },
  signatureBlock: {
    alignItems: 'center',
    width: 200,
  },
  signatureImage: {
    width: 120,
    height: 60,
    objectFit: 'contain',
    marginBottom: 5,
  },
  stampImage: {
    width: 80,
    height: 80,
    objectFit: 'contain',
    marginBottom: 5,
  },
  signatureLine: {
    width: '100%',
    borderTop: '1 solid #000',
    marginTop: 5,
    paddingTop: 5,
    textAlign: 'center',
  },
});

export default function LabPDFDocument({ patient, items, settings }: LabPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ENCABEZADO */}
        <View style={styles.header}>
          <Image src="/brand/bacteridex-logo.png" style={styles.logoImage} />
          <Text style={styles.titleLab}>LABORATORIO CLÍNICO</Text>
          <Text style={styles.titleReport}>INFORME DE RESULTADOS</Text>
        </View>

        {/* DATOS DEL PACIENTE */}
        <Text style={styles.sectionTitle}>DATOS DEL PACIENTE</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ width: '60%' }}>
            <View style={styles.row}>
              <Text style={styles.label}>Paciente:</Text>
              <Text style={styles.value}>{patient.patient_name || '---'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>DNI/Doc:</Text>
              <Text style={styles.value}>{patient.patient_document || '---'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Edad / Sexo:</Text>
              <Text style={styles.value}>
                {patient.patient_age ? `${patient.patient_age} años` : '---'} / {patient.patient_gender || '---'}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Tipo de muestra:</Text>
              <Text style={styles.value}>{patient.sample_type || '---'}</Text>
            </View>
          </View>
          <View style={{ width: '38%' }}>
            <View style={styles.row}>
              <Text style={styles.label}>N.º Informe:</Text>
              <Text style={styles.value}>{patient.report_number}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Fecha Toma:</Text>
              <Text style={styles.value}>{patient.sample_date || '---'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Hora Toma:</Text>
              <Text style={styles.value}>{patient.sample_time || '---'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Médico solicitante:</Text>
              <Text style={styles.value}>{patient.doctor_name || '---'}</Text>
            </View>
          </View>
        </View>

        {/* RESULTADOS */}
        <Text style={styles.sectionTitle}>RESULTADOS</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableColHeaderExamen}><Text style={styles.tableCellHeader}>Examen</Text></View>
            <View style={styles.tableColHeaderResultado}><Text style={styles.tableCellHeader}>Resultado</Text></View>
            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Unidad</Text></View>
            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Valores Ref.</Text></View>
            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Estado</Text></View>
          </View>
          {items.map((item, index) => (
            <View style={styles.tableRow} key={index}>
              <View style={styles.tableColExamen}><Text style={styles.tableCell}>{item.examen}</Text></View>
              <View style={styles.tableColResultado}>
                <Text style={styles.tableCell}>{item.resultado}</Text>
              </View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{item.unidad}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{item.referencia}</Text></View>
              <View style={styles.tableCol}>
                <Text style={[
                  styles.tableCell,
                  item.estado === 'ALTO' || item.estado === 'POSITIVO' ? styles.alto : {},
                  item.estado === 'BAJO' ? styles.bajo : {},
                ]}>{item.estado}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* OBSERVACIONES */}
        {patient.observations && (
          <View wrap={false}>
            <Text style={styles.sectionTitle}>OBSERVACIONES</Text>
            <View style={styles.observaciones}>
              <Text>{patient.observations}</Text>
            </View>
          </View>
        )}

        {/* FOOTER (Firma y Sello) */}
        <View style={styles.footer} wrap={false}>
          <View style={styles.signatureContainer}>
            {/* Sello */}
            <View style={styles.signatureBlock}>
              {settings.stamp_url ? (
                 <Image src={settings.stamp_url} style={styles.stampImage} />
              ) : <View style={{height: 85}} />}
            </View>
            
            {/* Firma */}
            <View style={styles.signatureBlock}>
              {settings.signature_url ? (
                 <Image src={settings.signature_url} style={styles.signatureImage} />
              ) : <View style={{height: 65}} />}
              <View style={styles.signatureLine}>
                <Text style={{fontWeight: 'bold'}}>{settings.professional_name || 'Profesional Responsable'}</Text>
                {settings.professional_title && <Text>{settings.professional_title}</Text>}
                {settings.professional_id && <Text>{settings.professional_id}</Text>}
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
