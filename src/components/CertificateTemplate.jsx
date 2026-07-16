import React from 'react';
import {
  Document, Page, View, Text, Image, Font, StyleSheet
} from '@react-pdf/renderer';

import openSansRegular from 'typeface-open-sans/files/open-sans-latin-400.woff';
import openSansItalic  from 'typeface-open-sans/files/open-sans-latin-400italic.woff';
import openSansBold    from 'typeface-open-sans/files/open-sans-latin-700.woff';

Font.register({
  family: 'Open Sans',
  fonts: [
    { src: openSansRegular, fontWeight: 400 },
    { src: openSansItalic,  fontWeight: 400, fontStyle: 'italic' },
    { src: openSansBold,    fontWeight: 700 },
  ],
});

Font.register({
  family: 'Black Mango',
  fonts: [
    { src: process.env.PUBLIC_URL + '/assets/fonts/BlackMango-Regular.ttf', fontWeight: 400 },
  ],
});

const NAVY       = '#002142';
const TERRACOTTA = '#BD593D';
const BLACK      = '#000000';
const PAGE_WIDTH  = 1500;
const PAGE_HEIGHT = 1060.5;
const CENTER      = PAGE_WIDTH / 2;

const styles = StyleSheet.create({
  page:           { backgroundColor: '#FFFFFF', fontFamily: 'Open Sans' },
  logo:           { position: 'absolute', left: 1240.5, top: 34.5, width: 229.5, height: 110.25 },
  cornerAccent:   { position: 'absolute', left: 861.75, top: 787.5, width: 638.25, height: 273 },
  title:          { position: 'absolute', top: 183.3, left: 0, width: PAGE_WIDTH, textAlign: 'center', fontFamily: 'Black Mango', fontWeight: 400, fontSize: 47.58, color: NAVY, letterSpacing: 4 },
  certifyLine:    { position: 'absolute', top: 296.0, left: 0, width: PAGE_WIDTH, textAlign: 'center', fontSize: 27.46, color: NAVY },
  name:           { position: 'absolute', top: 403.1, left: 0, width: PAGE_WIDTH, textAlign: 'center', fontFamily: 'Black Mango', fontWeight: 400, fontSize: 36.77, color: BLACK },
  divider1:       { position: 'absolute', top: 481.14, left: CENTER - 1061.12 / 2, width: 1061.12, height: 1.5, backgroundColor: BLACK, opacity: 0.12 },
  bodyLine1:      { position: 'absolute', top: 567.6, left: 0, width: PAGE_WIDTH, textAlign: 'center', fontSize: 27.46, color: BLACK },
  bodyBold:       { fontWeight: 700 },
  bodyLine2:      { position: 'absolute', top: 600.6, left: 0, width: PAGE_WIDTH, textAlign: 'center', fontSize: 27.46, color: BLACK },
  divider2:       { position: 'absolute', top: 746.76, left: CENTER - 495.68 / 2, width: 495.68, height: 1.5, backgroundColor: BLACK, opacity: 0.12 },
  signatureTitle: { position: 'absolute', top: 782.6, left: 0, width: PAGE_WIDTH, textAlign: 'center', fontSize: 21.13, fontStyle: 'italic', color: TERRACOTTA },
  signatureName:  { position: 'absolute', top: 806.2, left: 0, width: PAGE_WIDTH, textAlign: 'center', fontSize: 24.78, fontWeight: 700, color: BLACK },
  certNo:         { position: 'absolute', bottom: 30, left: 55, fontSize: 11, color: '#9AA3AC' },
});

export function CertificatePDF({
  learnerName,
  courseTitle,
  startDate,
  endDate,
  signatoryTitle,
  signatoryName,
  certificateNo,
}) {
  const LOGO_URL    = process.env.PUBLIC_URL + '/assets/rak-properties-logo.png';
  const CORNER_URL  = process.env.PUBLIC_URL + '/assets/rak-corner-accent.png';

  return (
    <Document>
      <Page size={[PAGE_WIDTH, PAGE_HEIGHT]} style={styles.page}>
        <Image src={LOGO_URL} style={styles.logo} />
        <Text style={styles.title}>CERTIFICATE OF APPRECIATION</Text>
        <Text style={styles.certifyLine}>This is to certify that</Text>
        <Text style={styles.name}>{learnerName}</Text>
        <View style={styles.divider1} />
        <Text style={styles.bodyLine1}>
          Has successfully completed <Text style={styles.bodyBold}>{courseTitle}</Text>
        </Text>
        <Text style={styles.bodyLine2}>
          Held from {startDate} to {endDate}
        </Text>
        <View style={styles.divider2} />
        <Text style={styles.signatureTitle}>{signatoryTitle}</Text>
        <Text style={styles.signatureName}>{signatoryName}</Text>
        {certificateNo && <Text style={styles.certNo}>{certificateNo}</Text>}
        <Image src={CORNER_URL} style={styles.cornerAccent} />
      </Page>
    </Document>
  );
}