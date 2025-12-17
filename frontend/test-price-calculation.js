/**
 * Quick Test Script untuk Verifikasi Perhitungan Harga
 * 
 * Cara penggunaan:
 * 1. Buka Browser DevTools Console
 * 2. Copy-paste script ini
 * 3. Jalankan testCalculation()
 */

// Test data simulasi
const testTarif = {
  id: "test-tarif-id",
  namaKombinasi: "Test Tarif",
  hargaKertasA4: 200,
  hargaKertasA5: 150,
  hargaKertasB5: 180,
  hargaSoftcover: 5000,
  hargaHardcover: 15000,
  biayaJilid: 7000,
  minimumPesanan: 5,
  aktif: true,
};

function testCalculation() {
  console.log("🧪 Testing Price Calculation");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // Test Case 1: Small order
  const test1 = calculatePrice({
    tarif: testTarif,
    formatKertas: "A5",
    jenisCover: "SOFTCOVER",
    jumlahHalaman: 100,
    jumlahBuku: 10,
  });

  console.log("\n✅ Test Case 1: Small Order (100 pages, 10 books, A5, Softcover)");
  console.log("Expected: ~Rp 270.000");
  console.log("Actual:", formatRupiah(test1.totalHarga));
  console.log("Breakdown:", test1.breakdown);
  console.log("Pass:", test1.totalHarga === 270000 ? "✅" : "❌");

  // Test Case 2: Large order
  const test2 = calculatePrice({
    tarif: testTarif,
    formatKertas: "A4",
    jenisCover: "HARDCOVER",
    jumlahHalaman: 200,
    jumlahBuku: 100,
  });

  console.log("\n✅ Test Case 2: Large Order (200 pages, 100 books, A4, Hardcover)");
  console.log("Expected: Rp 6.500.000");
  console.log("Actual:", formatRupiah(test2.totalHarga));
  console.log("Breakdown:", test2.breakdown);
  console.log("Pass:", test2.totalHarga === 6500000 ? "✅" : "❌");

  // Test Case 3: Edge case - minimum order
  const test3 = calculatePrice({
    tarif: testTarif,
    formatKertas: "B5",
    jenisCover: "SOFTCOVER",
    jumlahHalaman: 50,
    jumlahBuku: 5,
  });

  console.log("\n✅ Test Case 3: Minimum Order (50 pages, 5 books, B5, Softcover)");
  console.log("Expected: Rp 105.000");
  console.log("Actual:", formatRupiah(test3.totalHarga));
  console.log("Breakdown:", test3.breakdown);
  console.log("Pass:", test3.totalHarga === 105000 ? "✅" : "❌");

  // Test Case 4: Type safety - simulate string input
  console.log("\n🔒 Test Case 4: Type Safety (String Input)");
  const testTarifString = {
    ...testTarif,
    hargaKertasA5: "150", // Simulate string from API
    hargaSoftcover: "5000",
    biayaJilid: "7000",
  };

  const test4 = calculatePrice({
    tarif: testTarifString,
    formatKertas: "A5",
    jenisCover: "SOFTCOVER",
    jumlahHalaman: 100,
    jumlahBuku: 10,
  });

  console.log("Input types:", {
    hargaKertasA5: typeof testTarifString.hargaKertasA5,
    hargaSoftcover: typeof testTarifString.hargaSoftcover,
    biayaJilid: typeof testTarifString.biayaJilid,
  });
  console.log("Expected: Rp 270.000 (sama seperti Test 1)");
  console.log("Actual:", formatRupiah(test4.totalHarga));
  console.log("Pass:", test4.totalHarga === 270000 ? "✅ (Number conversion works!)" : "❌");

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎯 All Tests Completed!");
}

function calculatePrice({ tarif, formatKertas, jenisCover, jumlahHalaman, jumlahBuku }) {
  // 1. Hitung biaya kertas per lembar (convert ke number untuk safety)
  let hargaKertasPerLembar = 0;
  switch (formatKertas) {
    case "A4":
      hargaKertasPerLembar = Number(tarif.hargaKertasA4) || 0;
      break;
    case "A5":
      hargaKertasPerLembar = Number(tarif.hargaKertasA5) || 0;
      break;
    case "B5":
      hargaKertasPerLembar = Number(tarif.hargaKertasB5) || 0;
      break;
  }

  // 2. Hitung biaya cover per unit (convert ke number untuk safety)
  let hargaCoverPerUnit = 0;
  switch (jenisCover) {
    case "SOFTCOVER":
      hargaCoverPerUnit = Number(tarif.hargaSoftcover) || 0;
      break;
    case "HARDCOVER":
      hargaCoverPerUnit = Number(tarif.hargaHardcover) || 0;
      break;
  }

  // 3. Biaya jilid (convert ke number untuk safety)
  const hargaJilid = Number(tarif.biayaJilid) || 0;

  // 4. Hitung total per unit
  const biayaKertasPerUnit = hargaKertasPerLembar * jumlahHalaman;
  const biayaCoverPerUnit = hargaCoverPerUnit;
  const biayaJilidPerUnit = hargaJilid;
  const biayaPerUnit = biayaKertasPerUnit + biayaCoverPerUnit + biayaJilidPerUnit;

  // 5. Hitung total untuk semua buku
  const totalBiayaKertas = biayaKertasPerUnit * jumlahBuku;
  const totalBiayaCover = biayaCoverPerUnit * jumlahBuku;
  const totalBiayaJilid = biayaJilidPerUnit * jumlahBuku;
  const totalHarga = biayaPerUnit * jumlahBuku;

  return {
    biayaKertas: totalBiayaKertas,
    biayaCover: totalBiayaCover,
    biayaJilid: totalBiayaJilid,
    biayaPerUnit,
    totalHarga,
    breakdown: [
      { 
        label: `Kertas (${jumlahHalaman} hal × ${jumlahBuku} buku)`, 
        nilai: totalBiayaKertas 
      },
      { 
        label: `Cover (${jumlahBuku} buku)`, 
        nilai: totalBiayaCover 
      },
      { 
        label: `Jilid (${jumlahBuku} buku)`, 
        nilai: totalBiayaJilid 
      },
    ],
  };
}

function formatRupiah(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

// Auto-run test
console.log("📝 Price Calculation Test Script Loaded!");
console.log("Run testCalculation() to start testing");

// Uncomment to auto-run:
// testCalculation();
