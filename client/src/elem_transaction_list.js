import Transaction from './transaction';

class ElemTransactionList extends HTMLElement {
	constructor() {
		super();

		this._ws = null;

		this._accountName = '';
	}

	connectedCallback() {
		this.innerHTML = `
			<div class="title">Transactions</div>
			<div id="transactions"></div>`;
	}

	initialize(ws, accountName) {
		this._ws = ws;
		this._accountName = accountName;
		this.update();
	}

	async update() {
		if (this._ws !== null) {
			let transactions = await this._ws.send({
				'command': 'list transactions',
				'name': this._accountName,
				'start': 0,
				'length': 1000
			});
			let html = `
				<style>
					* {
						margin: 0;
					}

					#root {
						background: white;
					}

					a {
						display: inline-block;
						background: lightgrey;
						line-height: 1em;
						padding: .25em;
						text-align: center;
						text-decoration: none;
						color: black;
					}
				</style>
				<div id="content">
					<div id="import">Drag File Here To Import</div>
					<ol>`;
			for (let i = 0, l = transactions.length; i < l; i++) {
				let transaction = transactions[i];
				html += `
						<li><span class='description'>` + transaction.description + `</span> <span class='amount'>` + transaction.amount + `</span>`;
			}
			html += `
					</ol>
				</div>`;
			this.querySelector('#transactions').innerHTML = html;

			let contentElem = this._root.querySelector('#content');
			contentElem.addEventListener('dragover', (e) => {
				console.log('dragover');
				e.stopPropagation();
				e.preventDefault();
				e.dataTransfer.dropEffect = 'copy';
			}, false);
			contentElem.addEventListener('drop', (e) => {
				e.stopPropagation();
				e.preventDefault();
				var files = e.dataTransfer.files;

				for (let i = 0, l = files.length; i < l; i++) {
					let file = files[i];
					let extension = file.name.split('.').pop().toLowerCase();
					console.log(extension);
					var reader = new FileReader();
					if (extension === 'qfx' || extension === 'ofx') {
						reader.onload = async (e2) => {
							let transactions = await ElemTransactionList._getTransactionsFromOFX(e2.target.result);
							await this._ws.send({
								'command': 'add transactions',
								'name': this._accountName,
								'transactions': transactions
							});				
						};
						reader.readAsText(file); // start reading the file data.
					}
				}
			}, false);
		}
	}

	/**
	 * @param {string} content
	 */
	static async _getTransactionsFromOFX(content) {
		let transactions = [];
		let i = 0;
		while (i < content.length) {
			i = content.indexOf('<STMTTRN>', i) + '<STMTTRN>'.length;
			if (i === -1 + '<STMTTRN>'.length) {
				break;
			}
			let endI = content.indexOf('</STMTTRN>', i) + '</STMTTRN>'.length;
			let amountI = content.indexOf('<TRNAMT>', i) + '<TRNAMT>'.length;
			let dateI = content.indexOf('<DTPOSTED>', i) + '<DTPOSTED>'.length;
			let nameI = content.indexOf('<NAME>', i) + '<NAME>'.length;
			let idI = content.indexOf('<FITID>', i) + '<FITID>'.length;
			if (idI < endI && dateI < endI && amountI < endI) {
				let transaction = new Transaction();
				transaction.id = content.substr(idI, content.indexOf('<', idI) - idI).trim();
				transaction.date = content.substr(dateI, content.indexOf('<', dateI) - dateI).trim();
				transaction.amount = content.substr(amountI, content.indexOf('<', amountI) - amountI).trim();
				if (nameI < endI) {
					transaction.description = content.substr(nameI, content.indexOf('<', nameI) - nameI).trim();
				}
				transactions.push(transaction);
			}
		}
		return transactions;
	}
}

window.customElements.define('elem-transaction-list', ElemTransactionList);

export default ElemTransactionList;

var text = `
OFXHEADER:100
DATA:OFXSGML
VERSION:102
SECURITY:NONE
ENCODING:USASCII
CHARSET:1252
COMPRESSION:NONE
OLDFILEUID:NONE
NEWFILEUID:NONE

<OFX>
 <SIGNONMSGSRSV1>
  <SONRS>
   <STATUS>
    <CODE>0
    <SEVERITY>INFO
   </STATUS>
   <DTSERVER>20180221165750.506
   <LANGUAGE>ENG
   <FI>
    <ORG>DI
    <FID>322274187
   </FI>
   <INTU.BID>10626
   <INTU.USERID>fiddleplum
  </SONRS>
 </SIGNONMSGSRSV1>
 <CREDITCARDMSGSRSV1>
  <CCSTMTTRNRS>
   <TRNUID>0
   <STATUS>
    <CODE>0
    <SEVERITY>INFO
   </STATUS>
   <CCSTMTRS>
    <CURDEF>USD
    <CCACCTFROM>
     <ACCTID>0424939500-L0001
    </CCACCTFROM>
    <BANKTRANLIST>
     <DTSTART>20170101000000.000
     <DTEND>20180221000000.000
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170102000000.000
      <TRNAMT>-6.51
      <FITID>208130003
      <NAME>SWORK COFFEE 2160 COLORADO BLVD 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170102000000.000
      <TRNAMT>-12.00
      <FITID>208130004
      <NAME>T BOYLES TAVERN 37 N CATALINA AV
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170103000000.000
      <TRNAMT>-0.51
      <FITID>208130005
      <NAME>Amazon web services 440 Terry Av
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170103000000.000
      <TRNAMT>-12.96
      <FITID>208130006
      <NAME>TRADER JOE'S #171 QPS 467 ROSEME
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170104000000.000
      <TRNAMT>-6.81
      <FITID>208130007
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170105000000.000
      <TRNAMT>-7.63
      <FITID>208130008
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170105000000.000
      <TRNAMT>-3.96
      <FITID>208130009
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170106000000.000
      <TRNAMT>-66.60
      <FITID>208845057
      <NAME>ATHENS SERVICES 14048 VALLEY BLV
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170106000000.000
      <TRNAMT>-2.73
      <FITID>208845058
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170109000000.000
      <TRNAMT>-10.00
      <FITID>208845059
      <NAME>SQ *THE WALRUS AND 111 EAST HOLL
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170109000000.000
      <TRNAMT>-5.44
      <FITID>208845060
      <NAME>BA HUNTINGTON 51404283 1151 OXFO
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170109000000.000
      <TRNAMT>-25.56
      <FITID>208845061
      <NAME>RALPHS #0630 2270 LAKE AVE ALTAD
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170109000000.000
      <TRNAMT>-19.18
      <FITID>208845062
      <NAME>ALL INDIA CAFE 39 S. FAIR OAKS A
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170109000000.000
      <TRNAMT>-2.76
      <FITID>208845063
      <NAME>BAJA RANCH MARKET #2 2515 N. FAI
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170110000000.000
      <TRNAMT>-3.49
      <FITID>208845064
      <NAME>RALPHS #0630 2270 LAKE AVE ALTAD
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170110000000.000
      <TRNAMT>-4.25
      <FITID>208845065
      <NAME>CALTECH DINING SVCS. 1200 E CALI
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170111000000.000
      <TRNAMT>-58.00
      <FITID>208845066
      <NAME>NILOUFAR MOLAYEM DDS 1213 N. LAK
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170111000000.000
      <TRNAMT>-4.70
      <FITID>208845067
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170111000000.000
      <TRNAMT>-30.13
      <FITID>208845068
      <NAME>VONS Store00021394 1390 N ALLEN 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170112000000.000
      <TRNAMT>-17.00
      <FITID>209195866
      <NAME>Amazon web services 440 Terry Av
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170112000000.000
      <TRNAMT>-7.29
      <FITID>209195867
      <NAME>CHIPOTLE 0929 246 SOUTH LAKE AVE
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170113000000.000
      <TRNAMT>-5.53
      <FITID>209195868
      <NAME>CARL'S JR #7406 790 LAKE ST PASA
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170114000000.000
      <TRNAMT>-4.50
      <FITID>209195869
      <NAME>PASEO PARKING GARAGES 371 E GREE
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170116000000.000
      <TRNAMT>-7.36
      <FITID>209886677
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170116000000.000
      <TRNAMT>-14.13
      <FITID>209886678
      <NAME>ORCHARD SUPPLY #590 3425 E COLOR
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170116000000.000
      <TRNAMT>-24.32
      <FITID>209886679
      <NAME>ORCHARD SUPPLY #590 3425 E COLOR
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170117000000.000
      <TRNAMT>-4.89
      <FITID>209886680
      <NAME>SIDEWALK CAFE HTS 2057 N. LOS RO
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170117000000.000
      <TRNAMT>-3.17
      <FITID>209886681
      <NAME>SIDEWALK CAFE HTS 2057 N. LOS RO
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170117000000.000
      <TRNAMT>-5.96
      <FITID>209886682
      <NAME>SQ *COFFEE GALLERY 2029 N LAKE A
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170118000000.000
      <TRNAMT>-2.18
      <FITID>209886683
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170118000000.000
      <TRNAMT>-2.73
      <FITID>209886684
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170118000000.000
      <TRNAMT>-4.45
      <FITID>209886685
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170119000000.000
      <TRNAMT>-5.72
      <FITID>209886686
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170120000000.000
      <TRNAMT>-2.73
      <FITID>209886687
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170121000000.000
      <TRNAMT>-1.25
      <FITID>210622857
      <NAME>SUBWAY 03419512 122 E 17TH ST SA
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170121000000.000
      <TRNAMT>-5.35
      <FITID>210622858
      <NAME>SQ *JAMESON BROWN C 261279 ALLEN
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170123000000.000
      <TRNAMT>-7.00
      <FITID>210622859
      <NAME>CHICK-FIL-A #03349 1700 E COLORA
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170123000000.000
      <TRNAMT>-10.00
      <FITID>210622860
      <NAME>LAZ PARKING 640620 625 BROADWAY 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170123000000.000
      <TRNAMT>-15.99
      <FITID>210622861
      <NAME>SD Tap Room 1269 GARNET AVE. San
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170124000000.000
      <TRNAMT>-37.18
      <FITID>210622862
      <NAME>RAINBOW OAKS RESTAURAN 4815 5TH 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170124000000.000
      <TRNAMT>-14.43
      <FITID>210622863
      <NAME>RALPHS #0096 160 N LAKE AVE PASA
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170124000000.000
      <TRNAMT>-6.70
      <FITID>210622864
      <NAME>CALTECH DINING SVCS. 1200 E CALI
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170125000000.000
      <TRNAMT>-7.63
      <FITID>210622865
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170125000000.000
      <TRNAMT>-3.96
      <FITID>210622866
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170126000000.000
      <TRNAMT>-3.46
      <FITID>210622867
      <NAME>CHURCH'S CHICKEN # 710 NORTH FAI
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170127000000.000
      <TRNAMT>-15.00
      <FITID>210622868
      <NAME>GLOBAL PARKING SYSTEMS 3470 WILS
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170127000000.000
      <TRNAMT>-4.00
      <FITID>210673572
      <NAME>ABM PARKING THE COMMON 140 SOUTH
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170128000000.000
      <TRNAMT>-5.96
      <FITID>210675413
      <NAME>SQ *COFFEE GALLERY 2029 N LAKE A
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>CREDIT
      <DTPOSTED>20170128000000.000
      <TRNAMT>1922.35
      <FITID>210675414
      <NAME>Online Loan Payment From Share 0
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170130000000.000
      <TRNAMT>-7.62
      <FITID>211525832
      <NAME>EL METATE CAFE MEXICAN 12 N MENT
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170130000000.000
      <TRNAMT>-59.99
      <FITID>211525833
      <NAME>CHARTER COMMUNICATIONS 12405 Pow
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170130000000.000
      <TRNAMT>-7.60
      <FITID>211525834
      <NAME>EVEREST RESTAURANT 2314 LAKE AVE
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170130000000.000
      <TRNAMT>-6.81
      <FITID>211525835
      <NAME>SWORK COFFEE 2160 COLORADO BLVD 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170130000000.000
      <TRNAMT>-7.00
      <FITID>211525836
      <NAME>CHICK-FIL-A #03349 1700 E COLORA
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170130000000.000
      <TRNAMT>-20.43
      <FITID>211525837
      <NAME>OFFICEMAX/OFFICEDEPOT6 721 E COL
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170131000000.000
      <TRNAMT>-7.06
      <FITID>211525838
      <NAME>RITE AID STORE - 5526 735 EAST A
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170131000000.000
      <TRNAMT>-600.00
      <FITID>211525839
      <NAME>PAYPAL *MISSIOCOMMU 7700 EASTPOR
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170131000000.000
      <TRNAMT>-4.81
      <FITID>211525840
      <NAME>CALTECH DINING SVCS. 1200 E CALI
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170201000000.000
      <TRNAMT>-3.53
      <FITID>211525841
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170201000000.000
      <TRNAMT>-3.53
      <FITID>211525842
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170202000000.000
      <TRNAMT>-6.27
      <FITID>211525843
      <NAME>SQ *COFFEE GALLERY 2029 N LAKE A
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170203000000.000
      <TRNAMT>-7.61
      <FITID>211525844
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170203000000.000
      <TRNAMT>-0.51
      <FITID>212445899
      <NAME>Amazon web services 440 Terry Av
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170204000000.000
      <TRNAMT>-6.18
      <FITID>212445900
      <NAME>SQ *JAMESON BROWN C 261279 ALLEN
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170206000000.000
      <TRNAMT>-200.00
      <FITID>212445901
      <NAME>Loan Advance To Share 09
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170206000000.000
      <TRNAMT>-139.17
      <FITID>212445902
      <NAME>ORCHARD SUPPLY #590 3425 E COLOR
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170206000000.000
      <TRNAMT>-7.16
      <FITID>212445903
      <NAME>ORCHARD SUPPLY #590 3425 E COLOR
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170206000000.000
      <TRNAMT>-7.38
      <FITID>212445904
      <NAME>MIALMA 1543 E COLORADO BLVD PASA
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170206000000.000
      <TRNAMT>-4.51
      <FITID>212445905
      <NAME>STATERBROS073 9575 CENTRAL AVE. 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170206000000.000
      <TRNAMT>-59.58
      <FITID>212445906
      <NAME>RALPHS #0096 160 N LAKE AVE PASA
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170206000000.000
      <TRNAMT>-7.61
      <FITID>212445907
      <NAME>CARL'S JR #7406 790 LAKE ST PASA
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170207000000.000
      <TRNAMT>-6.43
      <FITID>212445908
      <NAME>CALTECH DINING SVCS. 1200 E CALI
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170208000000.000
      <TRNAMT>-7.61
      <FITID>212445909
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170209000000.000
      <TRNAMT>-7.88
      <FITID>212445910
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170211000000.000
      <TRNAMT>-2.99
      <FITID>213250979
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170211000000.000
      <TRNAMT>-2.18
      <FITID>213250980
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170213000000.000
      <TRNAMT>-5.96
      <FITID>213250981
      <NAME>SQ *COFFEE GALLERY 2029 N LAKE A
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170213000000.000
      <TRNAMT>-8.65
      <FITID>213250982
      <NAME>ROUNDS PREMIUM BURGERS 46 N LAKE
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170213000000.000
      <TRNAMT>-6.53
      <FITID>213250983
      <NAME>REDBOX *DVD RENTAL 1 Tower Lane 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170214000000.000
      <TRNAMT>-7.29
      <FITID>213250984
      <NAME>CHIPOTLE 0929 246 SOUTH LAKE AVE
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170215000000.000
      <TRNAMT>-7.88
      <FITID>213250985
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170216000000.000
      <TRNAMT>-7.88
      <FITID>213250986
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170216000000.000
      <TRNAMT>-12.00
      <FITID>213357732
      <NAME>UCLA PARKING SVCS 555 WESTWOOD P
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170216000000.000
      <TRNAMT>-3.49
      <FITID>213357733
      <NAME>UCLA HEALTH SYSTEM AUX 200 UCLA 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170217000000.000
      <TRNAMT>-17.39
      <FITID>213357734
      <NAME>ORCHARD SUPPLY #590 3425 E COLOR
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170217000000.000
      <TRNAMT>-7.61
      <FITID>213357735
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170218000000.000
      <TRNAMT>-9.36
      <FITID>213703232
      <NAME>DENNY'S INC 2627 E COLORADO BLVD
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170218000000.000
      <TRNAMT>-56.97
      <FITID>213703233
      <NAME>SPARK *CHRISTIANMING 5252 Edgewo
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170220000000.000
      <TRNAMT>-15.05
      <FITID>214128494
      <NAME>CRAFT HILL SOUTH PASAD 424 FAIR 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170220000000.000
      <TRNAMT>-10.65
      <FITID>214128495
      <NAME>SQ *COFFEE GALLERY 19791991 NORT
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170221000000.000
      <TRNAMT>-5.96
      <FITID>214128496
      <NAME>SQ *COFFEE GALLERY 2029 N LAKE A
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170222000000.000
      <TRNAMT>-1.62
      <FITID>214128497
      <NAME>BURGER KING #2274 Q07 765 N LAKE
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170222000000.000
      <TRNAMT>-32.28
      <FITID>214128498
      <NAME>VONS Store00021394 1390 N ALLEN 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170223000000.000
      <TRNAMT>-7.69
      <FITID>214128499
      <NAME>L L HAWAIIAN BBQ 319 S ARROYO PA
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170223000000.000
      <TRNAMT>-7.88
      <FITID>214128500
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170223000000.000
      <TRNAMT>-3.95
      <FITID>214128501
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>CREDIT
      <DTPOSTED>20170223000000.000
      <TRNAMT>1477.44
      <FITID>214128850
      <NAME>Online Loan Payment From Share 0
<MEMO>Total Payment: $1,477.44
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170224000000.000
      <TRNAMT>-6.80
      <FITID>214276418
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170227000000.000
      <TRNAMT>-5.96
      <FITID>214774747
      <NAME>SQ *COFFEE GALLERY 2029 N LAKE A
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170227000000.000
      <TRNAMT>-13.59
      <FITID>214774748
      <NAME>VEGGIE GRILL PDA 200 S LAKE PASA
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170227000000.000
      <TRNAMT>-94.50
      <FITID>214774749
      <NAME>STATE FARM 3 STATE FARM PLAZA SO
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170227000000.000
      <TRNAMT>-2.99
      <FITID>214774750
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170227000000.000
      <TRNAMT>-22.08
      <FITID>214774751
      <NAME>HARLOWE RESTAURANT 43 E UNION ST
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170228000000.000
      <TRNAMT>-3.48
      <FITID>215501391
      <NAME>CALTECH DINING SVCS. 1200 E CALI
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170228000000.000
      <TRNAMT>-4.81
      <FITID>215501392
      <NAME>CALTECH DINING SVCS. 1200 E CALI
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170301000000.000
      <TRNAMT>-59.99
      <FITID>215501393
      <NAME>CHARTER COMMUNICATIONS 12405 Pow
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170302000000.000
      <TRNAMT>-600.00
      <FITID>215501394
      <NAME>PAYPAL *MISSIOCC 7700 EASTPORT P
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170303000000.000
      <TRNAMT>-6.83
      <FITID>215501395
      <NAME>MCDONALD'S F11949 2157 LINCOLN A
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170303000000.000
      <TRNAMT>-9.19
      <FITID>215501396
      <NAME>BLAZE PIZZA 990 TOWN CENTER DR L
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170303000000.000
      <TRNAMT>-1.90
      <FITID>215501397
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170304000000.000
      <TRNAMT>-0.51
      <FITID>215501398
      <NAME>Amazon web services 440 Terry Av
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170304000000.000
      <TRNAMT>-5.96
      <FITID>215501399
      <NAME>SQ *COFFEE GALLERY 2029 N LAKE A
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170306000000.000
      <TRNAMT>-7.29
      <FITID>216054354
      <NAME>CHIPOTLE 0929 246 SOUTH LAKE AVE
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170306000000.000
      <TRNAMT>-5.74
      <FITID>216054355
      <NAME>SQ *JAMESON BROWN C 260 N ALLEN 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170306000000.000
      <TRNAMT>-7.60
      <FITID>216054356
      <NAME>EVEREST RESTAURANT 2314 LAKE AVE
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170306000000.000
      <TRNAMT>-2.95
      <FITID>216054357
      <NAME>SQ *JAMESON BROWN C 260 ALLEN AV
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170306000000.000
      <TRNAMT>-12.51
      <FITID>216054358
      <NAME>TENDER GREENS PASADENA 621 E COL
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170307000000.000
      <TRNAMT>-52.81
      <FITID>216054359
      <NAME>VONS Store00021394 1390 N ALLEN 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170308000000.000
      <TRNAMT>-4.81
      <FITID>216054360
      <NAME>CALTECH DINING SVCS. 1200 E CALI
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170308000000.000
      <TRNAMT>-6.80
      <FITID>216054361
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170309000000.000
      <TRNAMT>-4.44
      <FITID>216054362
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170309000000.000
      <TRNAMT>-7.34
      <FITID>216054363
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170310000000.000
      <TRNAMT>-7.61
      <FITID>216173872
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170310000000.000
      <TRNAMT>-3.95
      <FITID>216173873
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170311000000.000
      <TRNAMT>-9.04
      <FITID>216643779
      <NAME>RITE AID STORE - 5526 735 EAST A
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170311000000.000
      <TRNAMT>-7.88
      <FITID>216643780
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170313000000.000
      <TRNAMT>-5.96
      <FITID>216643781
      <NAME>SQ *SQ *COFFEE GALLERY 2029 N. L
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170313000000.000
      <TRNAMT>-6.43
      <FITID>216643782
      <NAME>RALPHS #0096 160 N LAKE AVE PASA
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170313000000.000
      <TRNAMT>-5.96
      <FITID>216643783
      <NAME>SQ *SQ *COFFEE GALLERY 1979-1991
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170313000000.000
      <TRNAMT>-6.53
      <FITID>216643784
      <NAME>HABIT-PASADENA #32 Q91 3733 E. F
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170314000000.000
      <TRNAMT>-4.95
      <FITID>216643785
      <NAME>SQU*SQ *JAMESON BROWN 260 N. All
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170315000000.000
      <TRNAMT>-11.89
      <FITID>216805635
      <NAME>EL PATRON MEXICAN FOOD 2555 Lake
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170315000000.000
      <TRNAMT>-4.06
      <FITID>216805636
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170315000000.000
      <TRNAMT>-7.88
      <FITID>216805637
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170315000000.000
      <TRNAMT>-3.95
      <FITID>216805638
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170317000000.000
      <TRNAMT>-4.36
      <FITID>217310143
      <NAME>DENNY'S #7734 27541 CHAMPIONSHIP
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170317000000.000
      <TRNAMT>-2.72
      <FITID>217310144
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170317000000.000
      <TRNAMT>-3.95
      <FITID>217310145
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170317000000.000
      <TRNAMT>-2.18
      <FITID>217310146
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170317000000.000
      <TRNAMT>-11.36
      <FITID>217310147
      <NAME>HOOK BURGER PASADENA 3453 E. FOO
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170320000000.000
      <TRNAMT>-12.90
      <FITID>217802529
      <NAME>RITE AID STORE - 5526 735 EAST A
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170320000000.000
      <TRNAMT>-28.48
      <FITID>217802530
      <NAME>UCLA PHYSICIANS PAY 5767 W CENTU
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170320000000.000
      <TRNAMT>-12.00
      <FITID>217802531
      <NAME>UCLA PARKING SVCS 555 WESTWOOD P
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170320000000.000
      <TRNAMT>-11.37
      <FITID>217802532
      <NAME>VONS Store00021394 1390 N ALLEN 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170320000000.000
      <TRNAMT>-6.38
      <FITID>217802533
      <NAME>UCLA R REAGAN DINE Q04 757 WESTW
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170320000000.000
      <TRNAMT>-662.85
      <FITID>217802534
      <NAME>UCLA HOSP PYMT 10920 WILSHIRE BL
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170320000000.000
      <TRNAMT>-6.51
      <FITID>217802535
      <NAME>RITE AID STORE - 5526 735 EAST A
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170320000000.000
      <TRNAMT>-0.11
      <FITID>217802536
      <NAME>RITE AID STORE - 5531 914 FAIR O
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170320000000.000
      <TRNAMT>-149.92
      <FITID>217802537
      <NAME>VONS Store00030759 1129 FAIR OAK
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170320000000.000
      <TRNAMT>-9.76
      <FITID>217802538
      <NAME>CARL'S JR #7406 790 LAKE ST PASA
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170321000000.000
      <TRNAMT>-16.35
      <FITID>217802539
      <NAME>VONS Store00021394 1390 N ALLEN 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170321000000.000
      <TRNAMT>-13.01
      <FITID>217802540
      <NAME>CARL'S JR #7406 790 LAKE ST PASA
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170327000000.000
      <TRNAMT>-2.32
      <FITID>218310285
      <NAME>CREWS IAD LLC 3351 AVIATION DR A
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170327000000.000
      <TRNAMT>-2.54
      <FITID>218310286
      <NAME>SUBWAY 03357431 44844 PACKAGE CT
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170327000000.000
      <TRNAMT>-4.03
      <FITID>218310287
      <NAME>STARBUCKS C GA10561512 44844 AUT
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170328000000.000
      <TRNAMT>-15.47
      <FITID>218415486
      <NAME>VONS Store00021394 1390 N ALLEN 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>CREDIT
      <DTPOSTED>20170328000000.000
      <TRNAMT>2050.69
      <FITID>218415672
      <NAME>Online Loan Payment From Share 0
<MEMO>Total Payment: $2,050.69
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170329000000.000
      <TRNAMT>-64.99
      <FITID>218717339
      <NAME>CHARTER COMMUNICATIONS 12405 Pow
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170329000000.000
      <TRNAMT>-7.34
      <FITID>218717340
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170329000000.000
      <TRNAMT>-281.10
      <FITID>218717341
      <NAME>HAHN 333, 7TH STREET SOUTH 185-5
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170330000000.000
      <TRNAMT>-7.34
      <FITID>218717342
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170331000000.000
      <TRNAMT>-600.00
      <FITID>218881480
      <NAME>PAYPAL *MISSIOCC 7700 EASTPORT P
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170331000000.000
      <TRNAMT>-4.89
      <FITID>218881481
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170403000000.000
      <TRNAMT>-26.23
      <FITID>219878314
      <NAME>RALPHS #0096 160 N LAKE AVE PASA
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170403000000.000
      <TRNAMT>-58.86
      <FITID>219878315
      <NAME>EASYJET000ES2HL8C GBP TRANSACTIO
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170403000000.000
      <TRNAMT>-0.53
      <FITID>219878316
      <NAME>Fee Loan Advance Card Fee
<MEMO>MASTERCARD ISSUER CROSS-BORDER F
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170403000000.000
      <TRNAMT>-4.32
      <FITID>219878317
      <NAME>HOSTEL WORLD CHARLEMONT EXCHANGE
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170403000000.000
      <TRNAMT>-0.04
      <FITID>219878318
      <NAME>Fee Loan Advance Card Fee
<MEMO>MASTERCARD ISSUER CROSS-BORDER F
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170403000000.000
      <TRNAMT>-9.39
      <FITID>219878319
      <NAME>HOSTEL WORLD CHARLEMONT EXCHANGE
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170403000000.000
      <TRNAMT>-0.08
      <FITID>219878320
      <NAME>Fee Loan Advance Card Fee
<MEMO>MASTERCARD ISSUER CROSS-BORDER F
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170403000000.000
      <TRNAMT>-3.14
      <FITID>219878321
      <NAME>HOSTEL WORLD CHARLEMONT EXCHANGE
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170403000000.000
      <TRNAMT>-0.03
      <FITID>219878322
      <NAME>Fee Loan Advance Card Fee
<MEMO>MASTERCARD ISSUER CROSS-BORDER F
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170403000000.000
      <TRNAMT>-2.25
      <FITID>219878323
      <NAME>HOSTEL WORLD CHARLEMONT EXCHANGE
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170403000000.000
      <TRNAMT>-0.02
      <FITID>219878324
      <NAME>Fee Loan Advance Card Fee
<MEMO>MASTERCARD ISSUER CROSS-BORDER F
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170403000000.000
      <TRNAMT>-7.50
      <FITID>219878325
      <NAME>STARBUCKS STORE 05648 454 North 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170403000000.000
      <TRNAMT>-10.25
      <FITID>219878326
      <NAME>HOSTEL WORLD CHARLEMONT EXCHANGE
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170403000000.000
      <TRNAMT>-0.09
      <FITID>219878327
      <NAME>Fee Loan Advance Card Fee
<MEMO>MASTERCARD ISSUER CROSS-BORDER F
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170403000000.000
      <TRNAMT>-472.00
      <FITID>219878328
      <NAME>Eurail Leidseveer 10 Utrecht NL
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170403000000.000
      <TRNAMT>-4.25
      <FITID>219878329
      <NAME>Fee Loan Advance Card Fee
<MEMO>MASTERCARD ISSUER CROSS-BORDER F
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170403000000.000
      <TRNAMT>-69.99
      <FITID>219878330
      <NAME>INTUIT *TURBOTAX 7535 Torrey San
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170404000000.000
      <TRNAMT>-12.45
      <FITID>219878331
      <NAME>Amazon web services 440 Terry Av
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>CREDIT
      <DTPOSTED>20170404000000.000
      <TRNAMT>0.53
      <FITID>219878332
      <NAME>Fee Loan Advance MC Fee Rebate
<MEMO>Logix Fee Rebate 0.53
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>CREDIT
      <DTPOSTED>20170404000000.000
      <TRNAMT>0.04
      <FITID>219878333
      <NAME>Fee Loan Advance MC Fee Rebate
<MEMO>Logix Fee Rebate 0.04
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>CREDIT
      <DTPOSTED>20170404000000.000
      <TRNAMT>0.08
      <FITID>219878334
      <NAME>Fee Loan Advance MC Fee Rebate
<MEMO>Logix Fee Rebate 0.08
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>CREDIT
      <DTPOSTED>20170404000000.000
      <TRNAMT>0.03
      <FITID>219878335
      <NAME>Fee Loan Advance MC Fee Rebate
<MEMO>Logix Fee Rebate 0.03
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>CREDIT
      <DTPOSTED>20170404000000.000
      <TRNAMT>0.02
      <FITID>219878336
      <NAME>Fee Loan Advance MC Fee Rebate
<MEMO>Logix Fee Rebate 0.02
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>CREDIT
      <DTPOSTED>20170404000000.000
      <TRNAMT>0.09
      <FITID>219878337
      <NAME>Fee Loan Advance MC Fee Rebate
<MEMO>Logix Fee Rebate 0.09
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>CREDIT
      <DTPOSTED>20170404000000.000
      <TRNAMT>4.25
      <FITID>219878338
      <NAME>Fee Loan Advance MC Fee Rebate
<MEMO>Logix Fee Rebate 4.25
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170405000000.000
      <TRNAMT>-44.98
      <FITID>219878339
      <NAME>Eurail Leidseveer 10 Utrecht NL
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170405000000.000
      <TRNAMT>-0.40
      <FITID>219878340
      <NAME>Fee Loan Advance Card Fee
<MEMO>MASTERCARD ISSUER CROSS-BORDER F
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170406000000.000
      <TRNAMT>-17.59
      <FITID>219878341
      <NAME>CVS/PHARMACY #03968 816 E MAIN S
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170406000000.000
      <TRNAMT>-20.88
      <FITID>219878342
      <NAME>PAYPAL *VOONHUILAI 7700 EASTPORT
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170406000000.000
      <TRNAMT>-66.60
      <FITID>219878343
      <NAME>ATHENS SERVICES 14048 VALLEY BLV
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170407000000.000
      <TRNAMT>-11.63
      <FITID>219878344
      <NAME>CHICK-FIL-A #03349 1700 E COLORA
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>CREDIT
      <DTPOSTED>20170407000000.000
      <TRNAMT>0.40
      <FITID>219878345
      <NAME>Fee Loan Advance MC Fee Rebate
<MEMO>Logix Fee Rebate 0.40
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170407000000.000
      <TRNAMT>-7.82
      <FITID>219878346
      <NAME>PANERA BREAD #601402 990 TOWN CE
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170407000000.000
      <TRNAMT>-9.57
      <FITID>219878347
      <NAME>PANDA EXPRESS #194 1216 FAIR OAK
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170408000000.000
      <TRNAMT>-7.88
      <FITID>219972403
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170409000000.000
      <TRNAMT>-24.99
      <FITID>220531785
      <NAME>Petoji 8308 SANDY CT 817-4879046
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170410000000.000
      <TRNAMT>-10.00
      <FITID>220531786
      <NAME>LA TRANSIT LAKE AVEQPS 340 N LAK
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170410000000.000
      <TRNAMT>-73.76
      <FITID>220531787
      <NAME>UNITED 600 Jefferson Street 800-
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170410000000.000
      <TRNAMT>-51.00
      <FITID>220531788
      <NAME>TRAVEL GUARD GROUP INC 3300 BUSI
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170410000000.000
      <TRNAMT>-15.95
      <FITID>220531789
      <NAME>FAIR OAKS CAR WASH 2164 FAIR OAK
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170410000000.000
      <TRNAMT>-34.25
      <FITID>220531790
      <NAME>ALDI 79116 2246 LAKE AVE. ALTADE
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170410000000.000
      <TRNAMT>-3.81
      <FITID>220531791
      <NAME>SQU*SQ *CREPE XPRESS C 345 South
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170410000000.000
      <TRNAMT>-6.27
      <FITID>220531792
      <NAME>SQ *SQ *COFFEE GALLERY 1979-1991
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170411000000.000
      <TRNAMT>-6.99
      <FITID>220531793
      <NAME>ALDI 79116 2246 LAKE AVE. ALTADE
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170411000000.000
      <TRNAMT>-14.00
      <FITID>220531794
      <NAME>NILOUFAR MOLAYEM DDS 1213 N. LAK
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170412000000.000
      <TRNAMT>-3.95
      <FITID>220531795
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170412000000.000
      <TRNAMT>-7.07
      <FITID>220531796
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170413000000.000
      <TRNAMT>-3.95
      <FITID>220727527
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170413000000.000
      <TRNAMT>-2.45
      <FITID>220727528
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170414000000.000
      <TRNAMT>-8.16
      <FITID>220727529
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170414000000.000
      <TRNAMT>-3.95
      <FITID>220727530
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170415000000.000
      <TRNAMT>-611.31
      <FITID>221162596
      <NAME>UCLA PHYSICIANS PAY 5767 W CENTU
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170415000000.000
      <TRNAMT>-560.00
      <FITID>221162597
      <NAME>UCLA HOSP PYMT 10920 WILSHIRE BL
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170417000000.000
      <TRNAMT>-5.64
      <FITID>221162598
      <NAME>SQ *SQ *COFFEE GALLERY 2029 N. L
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170417000000.000
      <TRNAMT>-227.21
      <FITID>221162599
      <NAME>THE HOME DEPOT #6629 1625 S MOUN
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170417000000.000
      <TRNAMT>-5.00
      <FITID>221162600
      <NAME>CINNABON 400 S. BALDWIN AVE ARCA
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170417000000.000
      <TRNAMT>-198.20
      <FITID>221162601
      <NAME>REI #63 ARCADIA 214 N Santa Anit
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170418000000.000
      <TRNAMT>-2.03
      <FITID>221701154
      <NAME>CALTECH MAIL SVC CENTE 1200 E CA
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170418000000.000
      <TRNAMT>-4.80
      <FITID>221701155
      <NAME>CALTECH DINING SVCS. 1200 E CALI
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170419000000.000
      <TRNAMT>-7.07
      <FITID>221701156
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170419000000.000
      <TRNAMT>-38.08
      <FITID>221701157
      <NAME>EXXONMOBIL 97649784 210 N SIERRA
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170419000000.000
      <TRNAMT>-3.74
      <FITID>221701158
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170420000000.000
      <TRNAMT>-20.68
      <FITID>221701159
      <NAME>ALDI 79116 2246 LAKE AVE. ALTADE
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170420000000.000
      <TRNAMT>-7.88
      <FITID>221701160
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170422000000.000
      <TRNAMT>-54.36
      <FITID>222290920
      <NAME>Amazon.com 440 Terry Ave N AMZN.
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170422000000.000
      <TRNAMT>-7.07
      <FITID>222290921
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170422000000.000
      <TRNAMT>-3.74
      <FITID>222290922
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170424000000.000
      <TRNAMT>-4.83
      <FITID>222290923
      <NAME>SQU*SQ *COFFEE GALLERY 1979-1991
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170424000000.000
      <TRNAMT>-6.58
      <FITID>222290924
      <NAME>SQU*SQ *COFFEE GALLERY 2029 N. L
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170424000000.000
      <TRNAMT>-6.51
      <FITID>222290925
      <NAME>DOG HAUS BIERGARDEN 93 E. GREEN 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170425000000.000
      <TRNAMT>-6.00
      <FITID>222290926
      <NAME>ALDI 79116 2246 LAKE AVE. ALTADE
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170425000000.000
      <TRNAMT>-2.95
      <FITID>222290927
      <NAME>STARBUCKS STORE 05674 3007 Hunti
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170425000000.000
      <TRNAMT>-4.80
      <FITID>222290928
      <NAME>CALTECH DINING SVCS. 1200 E CALI
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170426000000.000
      <TRNAMT>-6.80
      <FITID>222290929
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>CREDIT
      <DTPOSTED>20170428000000.000
      <TRNAMT>3880.71
      <FITID>222519733
      <NAME>Online Loan Payment From Share 0
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170428000000.000
      <TRNAMT>-3.53
      <FITID>222672796
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170428000000.000
      <TRNAMT>-4.34
      <FITID>222672797
      <NAME>HUNTING HOSP 60076296 100 W CALI
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170428000000.000
      <TRNAMT>-6.00
      <FITID>222672798
      <NAME>MODERN PARKING LOC 166 100 W CAL
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170429000000.000
      <TRNAMT>-7.00
      <FITID>222672799
      <NAME>CHICK-FIL-A #03349 1700 E COLORA
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170429000000.000
      <TRNAMT>-64.99
      <FITID>222672800
      <NAME>CHARTER COMMUNICATIONS 12405 Pow
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170501000000.000
      <TRNAMT>-3.37
      <FITID>223236711
      <NAME>HUNTING HOSP 60076296 100 W CALI
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170501000000.000
      <TRNAMT>-6.49
      <FITID>223236712
      <NAME>HUNTING HOSP 60076296 100 W CALI
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170501000000.000
      <TRNAMT>-4.34
      <FITID>223236713
      <NAME>HUNTING HOSP 60076296 100 W CALI
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170501000000.000
      <TRNAMT>-17.50
      <FITID>223236714
      <NAME>SHAKERS PASADENA 601 Fair Oaks A
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170501000000.000
      <TRNAMT>-3.37
      <FITID>223236715
      <NAME>HUNTING HOSP 60076296 100 W CALI
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170501000000.000
      <TRNAMT>-6.00
      <FITID>223236716
      <NAME>MODERN PARKING LOC 166 100 W CAL
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170501000000.000
      <TRNAMT>-355.45
      <FITID>223236717
      <NAME>UCLA PHYSICIANS PAY 5767 W CENTU
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170501000000.000
      <TRNAMT>-600.00
      <FITID>223236718
      <NAME>PAYPAL *MISSIOCC 7700 EASTPORT P
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170501000000.000
      <TRNAMT>-6.49
      <FITID>223236719
      <NAME>HUNTING HOSP 60076296 100 W CALI
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170501000000.000
      <TRNAMT>-3.37
      <FITID>223236720
      <NAME>HUNTING HOSP 60076296 100 W CALI
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170501000000.000
      <TRNAMT>-6.00
      <FITID>223236721
      <NAME>MODERN PARKING LOC 166 100 W CAL
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170503000000.000
      <TRNAMT>-7.24
      <FITID>223236722
      <NAME>CALTECH DINING SVCS. 1200 E CALI
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170503000000.000
      <TRNAMT>-7.07
      <FITID>223956549
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170503000000.000
      <TRNAMT>-6.49
      <FITID>223956550
      <NAME>HUNTING HOSP 60076296 100 W CALI
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170503000000.000
      <TRNAMT>-12.20
      <FITID>223956551
      <NAME>Amazon web services 440 Terry Av
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170503000000.000
      <TRNAMT>-6.00
      <FITID>223956552
      <NAME>MODERN PARKING LOC 166 100 W CAL
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170504000000.000
      <TRNAMT>-7.34
      <FITID>223956553
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170505000000.000
      <TRNAMT>-3.80
      <FITID>223956554
      <NAME>RITE AID STORE - 5526 735 EAST A
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170505000000.000
      <TRNAMT>-41.17
      <FITID>223956555
      <NAME>ALDI 79116 2246 LAKE AVE. ALTADE
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170505000000.000
      <TRNAMT>-7.34
      <FITID>223956556
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170505000000.000
      <TRNAMT>-4.62
      <FITID>223956557
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170505000000.000
      <TRNAMT>-4.45
      <FITID>223956558
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170505000000.000
      <TRNAMT>-5.00
      <FITID>223956559
      <NAME>MODERN PARKING LOC 166 100 W CAL
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170506000000.000
      <TRNAMT>-73.35
      <FITID>223956560
      <NAME>TARGET 00008839 777 EAST COLORAD
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170506000000.000
      <TRNAMT>-5.49
      <FITID>223956561
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170506000000.000
      <TRNAMT>-7.88
      <FITID>223956562
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170508000000.000
      <TRNAMT>-11.20
      <FITID>223956563
      <NAME>UNITED 600 Jefferson Street 800-
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170508000000.000
      <TRNAMT>-3.00
      <FITID>223956564
      <NAME>MODERN PARKING LOC 166 100 W CAL
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170508000000.000
      <TRNAMT>-6.00
      <FITID>223956565
      <NAME>MODERN PARKING LOC 166 100 W CAL
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170508000000.000
      <TRNAMT>-33.69
      <FITID>223956566
      <NAME>RITE AID STORE - 5531 914 FAIR O
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170508000000.000
      <TRNAMT>-5.32
      <FITID>223956567
      <NAME>CARL'S JR #7406 790 LAKE ST PASA
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170508000000.000
      <TRNAMT>-68.85
      <FITID>224552446
      <NAME>VONS Store00030759 1129 FAIR OAK
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170509000000.000
      <TRNAMT>-4.08
      <FITID>224552447
      <NAME>CITY OF HOPE N60092939 1500 E DU
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170510000000.000
      <TRNAMT>-1.89
      <FITID>224552448
      <NAME>CITY OF HOPE N60092939 1500 E DU
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170510000000.000
      <TRNAMT>-4.15
      <FITID>224552449
      <NAME>CITY OF HOPE N60092939 1500 E DU
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170511000000.000
      <TRNAMT>-6.51
      <FITID>224552450
      <NAME>CITY OF HOPE N60092939 1500 E DU
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170513000000.000
      <TRNAMT>-1.95
      <FITID>225098682
      <NAME>CITY OF HOPE N60092939 1500 E DU
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170513000000.000
      <TRNAMT>-5.97
      <FITID>225098683
      <NAME>CITY OF HOPE N60092939 1500 E DU
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170513000000.000
      <TRNAMT>-4.08
      <FITID>225098684
      <NAME>CITY OF HOPE N60092939 1500 E DU
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170515000000.000
      <TRNAMT>-6.51
      <FITID>225098685
      <NAME>CITY OF HOPE N60092939 1500 E DU
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170515000000.000
      <TRNAMT>-1.90
      <FITID>225098686
      <NAME>CITY OF HOPE N60092939 1500 E DU
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170515000000.000
      <TRNAMT>-75.00
      <FITID>225098687
      <NAME>UNITED 600 Jefferson Street 800-
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170515000000.000
      <TRNAMT>-39.20
      <FITID>225098688
      <NAME>UNITED 600 Jefferson Street 800-
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170516000000.000
      <TRNAMT>-9.23
      <FITID>225098689
      <NAME>CVS/PHARMACY #03968 816 E MAIN S
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170518000000.000
      <TRNAMT>-63.04
      <FITID>225728424
      <NAME>TARGET 00008839 777 EAST COLORAD
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170518000000.000
      <TRNAMT>-5.25
      <FITID>225728425
      <NAME>SQU*SQ *CAFE DE LECHE 2491-2501 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170519000000.000
      <TRNAMT>-3.00
      <FITID>225728426
      <NAME>HOSTEL WORLD CHARLEMONT EXCHANGE
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170519000000.000
      <TRNAMT>-0.03
      <FITID>225728427
      <NAME>Fee Loan Advance Card Fee
<MEMO>MASTERCARD ISSUER CROSS-BORDER F
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>CREDIT
      <DTPOSTED>20170519000000.000
      <TRNAMT>50.00
      <FITID>225728428
      <NAME>IDF 555 E. Wells St, Suite 414-9
<MEMO>Card Loan Advance Credit Voucher
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170519000000.000
      <TRNAMT>-270.00
      <FITID>225728429
      <NAME>IDF 555 E. Wells St, Suite 414-9
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170519000000.000
      <TRNAMT>-2.00
      <FITID>225728430
      <NAME>OLD PASADENA PARKING 33 E GREEN 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170520000000.000
      <TRNAMT>-6.27
      <FITID>225728431
      <NAME>SQU*SQ *COFFEE GALLERY 1979-1991
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>CREDIT
      <DTPOSTED>20170520000000.000
      <TRNAMT>0.03
      <FITID>225728432
      <NAME>Fee Loan Advance MC Fee Rebate
<MEMO>Logix Fee Rebate 0.03
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170520000000.000
      <TRNAMT>-10.86
      <FITID>225728433
      <NAME>BEST BUY 00001255 3415 E. FOOTHI
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170522000000.000
      <TRNAMT>-20.62
      <FITID>225728434
      <NAME>VONS Store00030759 1129 FAIR OAK
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170522000000.000
      <TRNAMT>-54.90
      <FITID>225728435
      <NAME>REI #63 ARCADIA 214 N Santa Anit
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170523000000.000
      <TRNAMT>-22.83
      <FITID>226232277
      <NAME>EURO YOUTH HOTEL Senefelderstr. 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170523000000.000
      <TRNAMT>-0.21
      <FITID>226232278
      <NAME>Fee Loan Advance Card Fee
<MEMO>MASTERCARD ISSUER CROSS-BORDER F
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170523000000.000
      <TRNAMT>-112.75
      <FITID>226232279
      <NAME>ATM Loan Advance #000000002296
<MEMO>AANKOMSTHAL 1 SCHIPHOL NL
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170523000000.000
      <TRNAMT>-1.01
      <FITID>226232280
      <NAME>Fee Loan Advance ATM Fee
<MEMO>MASTERCARD ISSUER CROSS-BORDER F
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170523000000.000
      <TRNAMT>-23.92
      <FITID>226232281
      <NAME>HUDSONNEWS ST1247 17022 MONTANER
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170523000000.000
      <TRNAMT>-6.43
      <FITID>226232282
      <NAME>NS SCHIPHOL AANKOMSTPASSAGE LUCH
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170523000000.000
      <TRNAMT>-0.06
      <FITID>226232283
      <NAME>Fee Loan Advance Card Fee
<MEMO>MASTERCARD ISSUER CROSS-BORDER F
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170524000000.000
      <TRNAMT>-3.27
      <FITID>226232284
      <NAME>GVB UAL T I CS 01 Stationsplein 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170524000000.000
      <TRNAMT>-0.03
      <FITID>226232285
      <NAME>Fee Loan Advance Card Fee
<MEMO>MASTERCARD ISSUER CROSS-BORDER F
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>CREDIT
      <DTPOSTED>20170524000000.000
      <TRNAMT>0.21
      <FITID>226232286
      <NAME>Fee Loan Advance MC Fee Rebate
<MEMO>Logix Fee Rebate 0.21
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>CREDIT
      <DTPOSTED>20170525000000.000
      <TRNAMT>0.06
      <FITID>226232287
      <NAME>Fee Loan Advance MC Fee Rebate
<MEMO>Logix Fee Rebate 0.06
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>CREDIT
      <DTPOSTED>20170525000000.000
      <TRNAMT>0.03
      <FITID>226232288
      <NAME>Fee Loan Advance MC Fee Rebate
<MEMO>Logix Fee Rebate 0.03
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170526000000.000
      <TRNAMT>-17.23
      <FITID>226232289
      <NAME>Gern im Stern Griesgasse 23-25 S
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170526000000.000
      <TRNAMT>-0.16
      <FITID>226232290
      <NAME>Fee Loan Advance Card Fee
<MEMO>MASTERCARD ISSUER CROSS-BORDER F
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170526000000.000
      <TRNAMT>-18.03
      <FITID>226728135
      <NAME>JUGENDHERBERGE YOHO PARACELSUSST
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170526000000.000
      <TRNAMT>-0.16
      <FITID>226728136
      <NAME>Fee Loan Advance Card Fee
<MEMO>MASTERCARD ISSUER CROSS-BORDER F
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>CREDIT
      <DTPOSTED>20170527000000.000
      <TRNAMT>0.16
      <FITID>226728137
      <NAME>Fee Loan Advance MC Fee Rebate
<MEMO>Logix Fee Rebate 0.16
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>CREDIT
      <DTPOSTED>20170528000000.000
      <TRNAMT>0.16
      <FITID>226728138
      <NAME>Fee Loan Advance MC Fee Rebate
<MEMO>Logix Fee Rebate 0.16
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170529000000.000
      <TRNAMT>-7.39
      <FITID>226728139
      <NAME>SPAR DANKT 2386 SUEDTIROLER PL 1
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170529000000.000
      <TRNAMT>-0.07
      <FITID>226728140
      <NAME>Fee Loan Advance Card Fee
<MEMO>MASTERCARD ISSUER CROSS-BORDER F
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>CREDIT
      <DTPOSTED>20170530000000.000
      <TRNAMT>0.07
      <FITID>226728141
      <NAME>Fee Loan Advance MC Fee Rebate
<MEMO>Logix Fee Rebate 0.07
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170530000000.000
      <TRNAMT>-15.70
      <FITID>226728142
      <NAME>AG592C8CD5D7EA9148 WWW SAN MARCO
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170530000000.000
      <TRNAMT>-0.14
      <FITID>226728143
      <NAME>Fee Loan Advance Card Fee
<MEMO>MASTERCARD ISSUER CROSS-BORDER F
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170530000000.000
      <TRNAMT>-16.83
      <FITID>226818290
      <NAME>VE.LA. S.P.A. FON.TA NUOVE,1 VEN
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170530000000.000
      <TRNAMT>-0.15
      <FITID>226818291
      <NAME>Fee Loan Advance Card Fee
<MEMO>MASTERCARD ISSUER CROSS-BORDER F
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170531000000.000
      <TRNAMT>-15.71
      <FITID>226818292
      <NAME>VE.LA. S.P.A. FONDAMENTA SANTA C
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170531000000.000
      <TRNAMT>-0.14
      <FITID>226818293
      <NAME>Fee Loan Advance Card Fee
<MEMO>MASTERCARD ISSUER CROSS-BORDER F
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170531000000.000
      <TRNAMT>-3.82
      <FITID>226818294
      <NAME>AIREST RETAIL S. R. L. VIALE LUI
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170531000000.000
      <TRNAMT>-0.03
      <FITID>226818295
      <NAME>Fee Loan Advance Card Fee
<MEMO>MASTERCARD ISSUER CROSS-BORDER F
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>CREDIT
      <DTPOSTED>20170531000000.000
      <TRNAMT>0.14
      <FITID>226818296
      <NAME>Fee Loan Advance MC Fee Rebate
<MEMO>Logix Fee Rebate 0.14
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>CREDIT
      <DTPOSTED>20170531000000.000
      <TRNAMT>2177.87
      <FITID>226820290
      <NAME>Online Loan Payment From Share 0
<MEMO>Total Payment: $2,177.87
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>CREDIT
      <DTPOSTED>20170531000000.000
      <TRNAMT>15.70
      <FITID>227492073
      <NAME>Loan Advance TEMP CREDIT
<MEMO>TEMO CR/ ALILAGUNA
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170601000000.000
      <TRNAMT>-64.99
      <FITID>227492074
      <NAME>CHARTER COMMUNICATIONS 12405 Pow
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>CREDIT
      <DTPOSTED>20170601000000.000
      <TRNAMT>0.15
      <FITID>227492075
      <NAME>Fee Loan Advance MC Fee Rebate
<MEMO>Logix Fee Rebate 0.15
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>CREDIT
      <DTPOSTED>20170601000000.000
      <TRNAMT>0.14
      <FITID>227492076
      <NAME>Fee Loan Advance MC Fee Rebate
<MEMO>Logix Fee Rebate 0.14
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>CREDIT
      <DTPOSTED>20170601000000.000
      <TRNAMT>0.03
      <FITID>227492077
      <NAME>Fee Loan Advance MC Fee Rebate
<MEMO>Logix Fee Rebate 0.03
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170601000000.000
      <TRNAMT>-600.00
      <FITID>227492078
      <NAME>PAYPAL *MISSIOCC 7700 EASTPORT P
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170601000000.000
      <TRNAMT>-46.05
      <FITID>227492079
      <NAME>VONS STORE 00028589 2355 E COLOR
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170602000000.000
      <TRNAMT>-6.80
      <FITID>227492080
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170602000000.000
      <TRNAMT>-3.74
      <FITID>227492081
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170603000000.000
      <TRNAMT>-7.61
      <FITID>227492082
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170603000000.000
      <TRNAMT>-1.74
      <FITID>227492083
      <NAME>ORCHARD SUPPLY #610 425 FAIR OAK
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170605000000.000
      <TRNAMT>-15.29
      <FITID>227846973
      <NAME>THE HOME DEPOT #6629 1625 S MOUN
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170605000000.000
      <TRNAMT>-7.00
      <FITID>227846974
      <NAME>CHICK-FIL-A #03349 1700 E COLORA
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170605000000.000
      <TRNAMT>-600.00
      <FITID>227846975
      <NAME>PAYPAL *MISSIOCC 7700 EASTPORT P
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170606000000.000
      <TRNAMT>-6.27
      <FITID>227846976
      <NAME>SQU*SQ *COFFEE GALLERY 1979-1991
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170606000000.000
      <TRNAMT>-4.89
      <FITID>227846977
      <NAME>JAMBA JUICE 0112 204 S LAKE AVE 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170607000000.000
      <TRNAMT>-7.88
      <FITID>228372195
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170608000000.000
      <TRNAMT>-9.88
      <FITID>228372196
      <NAME>EL PATRON MEXICAN FOOD 2555 Lake
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170608000000.000
      <TRNAMT>-6.58
      <FITID>228372197
      <NAME>SQU*SQ *COFFEE GALLERY 2029 N. L
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170609000000.000
      <TRNAMT>-3.74
      <FITID>228372198
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170609000000.000
      <TRNAMT>-7.61
      <FITID>228372199
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170610000000.000
      <TRNAMT>-12.50
      <FITID>228372200
      <NAME>Amazon web services 440 Terry Av
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170612000000.000
      <TRNAMT>-7.83
      <FITID>228848507
      <NAME>RALPHS #0096 160 N LAKE AVE PASA
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170612000000.000
      <TRNAMT>-14.55
      <FITID>228848508
      <NAME>TLT FOOD - PASADENA 36 S EL MOLI
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170613000000.000
      <TRNAMT>-6.27
      <FITID>228848509
      <NAME>SQU*SQ *COFFEE GALLERY 2029 N. L
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170613000000.000
      <TRNAMT>-5.69
      <FITID>228848510
      <NAME>JAMBA JUICE 0112 204 S LAKE AVE 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170614000000.000
      <TRNAMT>-32.25
      <FITID>228848511
      <NAME>EDWARDS ALHAMBRA RENAI 1 E MAIN 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170614000000.000
      <TRNAMT>-3.95
      <FITID>228848512
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170614000000.000
      <TRNAMT>-7.61
      <FITID>228848513
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170615000000.000
      <TRNAMT>-3.95
      <FITID>229371786
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170615000000.000
      <TRNAMT>-7.61
      <FITID>229371787
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170617000000.000
      <TRNAMT>-26.00
      <FITID>229371788
      <NAME>MARRIOTT ANAHEIM PARKI 700 WEST 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170619000000.000
      <TRNAMT>-6.25
      <FITID>229696429
      <NAME>MARRIOTT ANAHEIM F B 700 WEST CO
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170619000000.000
      <TRNAMT>-26.00
      <FITID>229696430
      <NAME>MARRIOTT ANAHEIM PARKI 700 WEST 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170619000000.000
      <TRNAMT>-6.48
      <FITID>229696431
      <NAME>CVS/PHARMACY #09142 1550 E COVEL
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170620000000.000
      <TRNAMT>-32.04
      <FITID>229696432
      <NAME>TASTY KITCHEN 335 F ST DAVIS CA
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170620000000.000
      <TRNAMT>-6.27
      <FITID>229696433
      <NAME>SQU*SQ *COFFEE GALLERY 2029 N. L
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170620000000.000
      <TRNAMT>-35.28
      <FITID>229696434
      <NAME>VONS Store00021394 1390 N ALLEN 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170621000000.000
      <TRNAMT>-6.25
      <FITID>229942023
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170621000000.000
      <TRNAMT>-4.62
      <FITID>229942024
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170621000000.000
      <TRNAMT>-3.95
      <FITID>229942025
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170622000000.000
      <TRNAMT>-7.88
      <FITID>229942026
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170623000000.000
      <TRNAMT>-6.80
      <FITID>230221544
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170623000000.000
      <TRNAMT>-3.95
      <FITID>230221545
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170624000000.000
      <TRNAMT>-6.27
      <FITID>230221546
      <NAME>SQU*SQ *COFFEE GALLERY 2029 N. L
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>CREDIT
      <DTPOSTED>20170625000000.000
      <TRNAMT>1745.57
      <FITID>230221846
      <NAME>Online Loan Payment From Share 0
<MEMO>Total Payment: $1,745.57
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170626000000.000
      <TRNAMT>-6.27
      <FITID>230468392
      <NAME>SQU*SQ *COFFEE GALLERY 2029 N. L
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170626000000.000
      <TRNAMT>-10.47
      <FITID>230468393
      <NAME>DELUXE LOUNGE CAFE 1717 EAST WAS
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170626000000.000
      <TRNAMT>-22.87
      <FITID>230468394
      <NAME>EL TORITO PASADENA 3333 EAST FOO
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170627000000.000
      <TRNAMT>-6.51
      <FITID>230468395
      <NAME>DOG HAUS HILL 105 N. HILL STREET
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170628000000.000
      <TRNAMT>-7.88
      <FITID>230629320
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170629000000.000
      <TRNAMT>-6.25
      <FITID>231210633
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170629000000.000
      <TRNAMT>-64.99
      <FITID>231210634
      <NAME>CHARTER COMMUNICATIONS 12405 Pow
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170701000000.000
      <TRNAMT>-8.97
      <FITID>231210635
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170701000000.000
      <TRNAMT>-3.95
      <FITID>231210636
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170703000000.000
      <TRNAMT>-4.44
      <FITID>231862468
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170703000000.000
      <TRNAMT>-7.88
      <FITID>231862469
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170703000000.000
      <TRNAMT>-12.20
      <FITID>231862470
      <NAME>Amazon web services 440 Terry Av
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170703000000.000
      <TRNAMT>-8.51
      <FITID>231862471
      <NAME>CHICK-FIL-A #03349 1700 E COLORA
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170704000000.000
      <TRNAMT>-19.93
      <FITID>231862472
      <NAME>UMAMI BURGER PASADENA 49 E COLOR
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170705000000.000
      <TRNAMT>-7.60
      <FITID>231862473
      <NAME>EVEREST RESTAURANT 2314 LAKE AVE
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170705000000.000
      <TRNAMT>-22.27
      <FITID>231862474
      <NAME>VONS Store00021394 1390 N ALLEN 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170705000000.000
      <TRNAMT>-47.98
      <FITID>231862475
      <NAME>SPARK *CHRISTIANMING 5252 Edgewo
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170705000000.000
      <TRNAMT>-16.24
      <FITID>231862476
      <NAME>RALPHS #0096 160 N LAKE AVE PASA
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170706000000.000
      <TRNAMT>-7.64
      <FITID>231862477
      <NAME>IKEA BURBANK 600 IKEA WAY BURBAN
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170707000000.000
      <TRNAMT>-174.98
      <FITID>232376886
      <NAME>HONDA OF PASADENA 1965 E FOOTHIL
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170707000000.000
      <TRNAMT>-8.51
      <FITID>232376887
      <NAME>CHICK-FIL-A #03349 1700 E COLORA
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170707000000.000
      <TRNAMT>-5.85
      <FITID>232376888
      <NAME>SQ *JAMESON BROWN C 260 N ALLEN 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170708000000.000
      <TRNAMT>-6.60
      <FITID>232376889
      <NAME>SQU*SQ *COFFEE GALLERY 2029 N. L
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170710000000.000
      <TRNAMT>-8.73
      <FITID>232376890
      <NAME>RITE AID STORE - 5526 735 EAST A
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170710000000.000
      <TRNAMT>-24.76
      <FITID>232376891
      <NAME>VONS Store00021527 155 CALIFORNI
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170710000000.000
      <TRNAMT>-6.60
      <FITID>232376892
      <NAME>SQU*SQ *COFFEE GALLERY 1979-1991
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170710000000.000
      <TRNAMT>-6.28
      <FITID>232376893
      <NAME>URBAN PLATES #11 269 S LAKE AVE 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170710000000.000
      <TRNAMT>-15.84
      <FITID>232376894
      <NAME>URBAN PLATES #11 269 S LAKE AVE 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170710000000.000
      <TRNAMT>-49.00
      <FITID>232376895
      <NAME>AAA CA MBR RENEWAL - R 3333 FAIR
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170711000000.000
      <TRNAMT>-2.19
      <FITID>232688156
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170712000000.000
      <TRNAMT>-7.92
      <FITID>232688157
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170712000000.000
      <TRNAMT>-3.97
      <FITID>232688158
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170712000000.000
      <TRNAMT>-70.40
      <FITID>232688159
      <NAME>ATHENS SERVICES 14048 VALLEY BLV
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170712000000.000
      <TRNAMT>-25.19
      <FITID>232688160
      <NAME>BRISTOL FARMS # 02 606 FAIR OAKS
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170713000000.000
      <TRNAMT>-7.10
      <FITID>232688161
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170714000000.000
      <TRNAMT>-7.10
      <FITID>232991965
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170714000000.000
      <TRNAMT>-3.76
      <FITID>232991966
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170715000000.000
      <TRNAMT>-5.19
      <FITID>232991967
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170717000000.000
      <TRNAMT>-66.61
      <FITID>233558551
      <NAME>TARGET 00008839 777 EAST COLORAD
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170717000000.000
      <TRNAMT>-4.95
      <FITID>233558552
      <NAME>SQ *JAMESON BROWN C 260 ALLEN AV
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170717000000.000
      <TRNAMT>-6.21
      <FITID>233558553
      <NAME>COPA VIDA CAFE LLC 2680 Nina St 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170717000000.000
      <TRNAMT>-7.08
      <FITID>233558554
      <NAME>CHICK-FIL-A #03349 1700 E COLORA
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170717000000.000
      <TRNAMT>-6.60
      <FITID>233558555
      <NAME>SQU*SQ *COFFEE GALLERY 2029 N. L
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170719000000.000
      <TRNAMT>-6.94
      <FITID>233558556
      <NAME>MCDONALD'S F804 799 N. LAKE AVE.
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170719000000.000
      <TRNAMT>-3.76
      <FITID>233558557
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170719000000.000
      <TRNAMT>-6.83
      <FITID>233558558
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170720000000.000
      <TRNAMT>-22.71
      <FITID>233558559
      <NAME>ALDI 79116 2246 LAKE AVE. ALTADE
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170720000000.000
      <TRNAMT>-3.76
      <FITID>233558560
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170720000000.000
      <TRNAMT>-7.65
      <FITID>233558561
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170720000000.000
      <TRNAMT>-552.06
      <FITID>234127911
      <NAME>STATE FARM INSURANCE 3 STATE FAR
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170721000000.000
      <TRNAMT>-2.73
      <FITID>234127912
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170722000000.000
      <TRNAMT>-15.95
      <FITID>234127913
      <NAME>HWOOD BOWL CON60071792 2301 N HI
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170722000000.000
      <TRNAMT>-116.82
      <FITID>234127914
      <NAME>Amazon.com 440 Terry Ave N AMZN.
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170724000000.000
      <TRNAMT>-6.28
      <FITID>234127915
      <NAME>SQU*SQ *COFFEE GALLERY 2029 N. L
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170724000000.000
      <TRNAMT>-10.38
      <FITID>234127916
      <NAME>URBAN PLATES #11 269 S LAKE AVE 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170724000000.000
      <TRNAMT>-8.94
      <FITID>234127917
      <NAME>JACK IN THE BOX 0312 901 W Las T
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>CREDIT
      <DTPOSTED>20170724000000.000
      <TRNAMT>1580.50
      <FITID>234128237
      <NAME>Online Loan Payment From Share 0
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170726000000.000
      <TRNAMT>-2.72
      <FITID>234707530
      <NAME>BURGER KING #2274 Q07 765 N LAKE
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170726000000.000
      <TRNAMT>-5.11
      <FITID>234707531
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170726000000.000
      <TRNAMT>-4.09
      <FITID>234707532
      <NAME>VONS Store00021394 1390 N ALLEN 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170727000000.000
      <TRNAMT>-2.46
      <FITID>234707533
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170727000000.000
      <TRNAMT>-3.76
      <FITID>234707534
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170728000000.000
      <TRNAMT>-4.10
      <FITID>234707535
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170728000000.000
      <TRNAMT>-6.83
      <FITID>234707536
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170729000000.000
      <TRNAMT>-64.99
      <FITID>234707537
      <NAME>CHARTER COMMUNICATIONS 12405 Pow
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170729000000.000
      <TRNAMT>-4.10
      <FITID>234709553
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170729000000.000
      <TRNAMT>-3.97
      <FITID>235332809
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170731000000.000
      <TRNAMT>-6.28
      <FITID>235332810
      <NAME>SQU*SQ *COFFEE GALLERY 2029 N. L
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170731000000.000
      <TRNAMT>-6.60
      <FITID>235332811
      <NAME>SQU*SQ *COFFEE GALLERY 2029 N. L
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170731000000.000
      <TRNAMT>-4.89
      <FITID>235332812
      <NAME>JAMBA JUICE 0112 204 S LAKE AVE 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170731000000.000
      <TRNAMT>-2.73
      <FITID>235332813
      <NAME>MCDONALD'S F942 716 FAIR OAKS AV
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170731000000.000
      <TRNAMT>-39.70
      <FITID>235332814
      <NAME>VONS Store00021394 1390 N ALLEN 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170801000000.000
      <TRNAMT>-7.00
      <FITID>235332815
      <NAME>LA TRANSIT FILLMOREQPS 95 FILMOR
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170801000000.000
      <TRNAMT>-2.05
      <FITID>235332816
      <NAME>UCLA R REAGAN DINE Q04 757 WESTW
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170802000000.000
      <TRNAMT>-12.00
      <FITID>235332817
      <NAME>UCLA PARKING SVCS 555 WESTWOOD P
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170802000000.000
      <TRNAMT>-3.26
      <FITID>235332818
      <NAME>JACK IN THE BOX 3319 2125 N Wind
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170802000000.000
      <TRNAMT>-3.76
      <FITID>235958806
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170802000000.000
      <TRNAMT>-2.73
      <FITID>235958807
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170803000000.000
      <TRNAMT>-12.50
      <FITID>235958808
      <NAME>Amazon web services 440 Terry Av
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170803000000.000
      <TRNAMT>-4.00
      <FITID>235958809
      <NAME>2LEVYATLACONVT14554232 1201 S FI
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170804000000.000
      <TRNAMT>-4.45
      <FITID>235958810
      <NAME>STARBUCKS STORE 15062 800 N. Ala
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170804000000.000
      <TRNAMT>-6.00
      <FITID>235958811
      <NAME>2LEVYATLACONVT14554232 1201 S FI
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170804000000.000
      <TRNAMT>-7.92
      <FITID>235958812
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170804000000.000
      <TRNAMT>-27.21
      <FITID>235958813
      <NAME>ORIGINAL PEPPERS MEXIC 181 COLOR
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170805000000.000
      <TRNAMT>-6.28
      <FITID>235958814
      <NAME>SQU*SQ *COFFEE GALLERY 2029 N. L
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170807000000.000
      <TRNAMT>-21.28
      <FITID>236492492
      <NAME>SQU*SQ *HIGHLIGHT COFF 701 E Bro
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170807000000.000
      <TRNAMT>-4.97
      <FITID>236492493
      <NAME>SQU*SQ *HONEY CUP COFF 3164-3702
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170808000000.000
      <TRNAMT>-3.26
      <FITID>236492494
      <NAME>JACK IN THE BOX 3319 2125 N Wind
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170809000000.000
      <TRNAMT>-3.76
      <FITID>236492495
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170809000000.000
      <TRNAMT>-2.73
      <FITID>236492496
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170809000000.000
      <TRNAMT>-3.55
      <FITID>236492497
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170810000000.000
      <TRNAMT>-196.00
      <FITID>236492498
      <NAME>NILOUFAR MOLAYEM DDS 1213 N. LAK
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170810000000.000
      <TRNAMT>-7.65
      <FITID>236492499
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170810000000.000
      <TRNAMT>-1.20
      <FITID>236492500
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170811000000.000
      <TRNAMT>-6.28
      <FITID>236733353
      <NAME>SQU*SQ *COFFEE GALLERY 1979-1991
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170811000000.000
      <TRNAMT>-26.72
      <FITID>236733354
      <NAME>VONS Store00021394 1390 N ALLEN 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170814000000.000
      <TRNAMT>-7.37
      <FITID>237360307
      <NAME>ROUNDS PREMIUM BURGERS 46 N LAKE
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170814000000.000
      <TRNAMT>-14.78
      <FITID>237360308
      <NAME>AMC SANTA ANITA 16 #02 400 BALDW
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170814000000.000
      <TRNAMT>-6.28
      <FITID>237360309
      <NAME>SQU*SQ *COFFEE GALLERY 1979-1991
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170814000000.000
      <TRNAMT>-780.15
      <FITID>237360310
      <NAME>MCC HOMEOWNERS GW 1700 GreenBria
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170815000000.000
      <TRNAMT>-3.76
      <FITID>237360311
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170816000000.000
      <TRNAMT>-6.87
      <FITID>237360312
      <NAME>CHARLIE'S TRIO 5769 NORTH HUNTIN
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170816000000.000
      <TRNAMT>-3.15
      <FITID>237360313
      <NAME>MCDONALD'S F11949 2157 LINCOLN A
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170816000000.000
      <TRNAMT>-100.00
      <FITID>237360314
      <NAME>WYCLIFFE BIBLE TRANSL 11221 John
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170817000000.000
      <TRNAMT>-196.00
      <FITID>237360315
      <NAME>NILOUFAR MOLAYEM DDS 1213 N. LAK
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170817000000.000
      <TRNAMT>-5.19
      <FITID>237360316
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170817000000.000
      <TRNAMT>-3.76
      <FITID>237360317
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170817000000.000
      <TRNAMT>-6.60
      <FITID>237837492
      <NAME>SQU*SQ *COFFEE GALLERY 1979-1991
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170819000000.000
      <TRNAMT>-4.95
      <FITID>237837493
      <NAME>SQ *JAMESON BROWN C 260 ALLEN AV
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170821000000.000
      <TRNAMT>-6.60
      <FITID>238407677
      <NAME>SQU*SQ *COFFEE GALLERY 2029 N. L
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170821000000.000
      <TRNAMT>-113.00
      <FITID>238407678
      <NAME>STATE OF CALIF DMV INT 2415 1ST 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170821000000.000
      <TRNAMT>-5.83
      <FITID>238407679
      <NAME>WONDER BURGER 2584 E FOOTHILL BL
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170821000000.000
      <TRNAMT>-20.94
      <FITID>238407680
      <NAME>CHEVRON 0090098 918 S SAN GABRIE
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170821000000.000
      <TRNAMT>-5.01
      <FITID>238407681
      <NAME>MCDONALD'S F804 799 N. LAKE AVE.
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170822000000.000
      <TRNAMT>-3.76
      <FITID>238407682
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170822000000.000
      <TRNAMT>-2.46
      <FITID>238407683
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170823000000.000
      <TRNAMT>-6.72
      <FITID>238407684
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170823000000.000
      <TRNAMT>-35.46
      <FITID>238407685
      <NAME>DIN TAI FUNG ARCAD 400 BALDWIN A
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170824000000.000
      <TRNAMT>-1.20
      <FITID>238407686
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170824000000.000
      <TRNAMT>-3.97
      <FITID>238407687
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170825000000.000
      <TRNAMT>-6.60
      <FITID>238407688
      <NAME>SQU*SQ *COFFEE GALLERY 2029 N. L
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170825000000.000
      <TRNAMT>-8.18
      <FITID>238407689
      <NAME>TACO DELI 456 FOOTHILL BLVD STE 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170826000000.000
      <TRNAMT>-36.97
      <FITID>238977247
      <NAME>RITE AID STORE - 5526 735 EAST A
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170826000000.000
      <TRNAMT>-7.43
      <FITID>238977248
      <NAME>CHICK-FIL-A #03349 1700 E COLORA
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170826000000.000
      <TRNAMT>-13.47
      <FITID>238977249
      <NAME>CHARLIE'S TRIO 5769 NORTH HUNTIN
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170828000000.000
      <TRNAMT>-1.29
      <FITID>238977250
      <NAME>ALDI 79116 2246 LAKE AVE. ALTADE
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170828000000.000
      <TRNAMT>-4.95
      <FITID>238977251
      <NAME>SQ *JAMESON BROWN C 260 N ALLEN 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170828000000.000
      <TRNAMT>-6.00
      <FITID>238977252
      <NAME>ACADEMY CINEMAS 1003 E COLORADO 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170828000000.000
      <TRNAMT>-50.28
      <FITID>238977253
      <NAME>VONS Store00021394 1390 N ALLEN 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170828000000.000
      <TRNAMT>-17.56
      <FITID>238977254
      <NAME>ORIGINAL PEPPERS MEXIC 181 COLOR
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170828000000.000
      <TRNAMT>-6.50
      <FITID>238977255
      <NAME>2DODGER STADM 14545305 1000 ELYS
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170829000000.000
      <TRNAMT>-2.18
      <FITID>238977256
      <NAME>CARL'S JR #7406 790 LAKE ST PASA
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170829000000.000
      <TRNAMT>-64.99
      <FITID>238977257
      <NAME>CHARTER COMMUNICATIONS 12405 Pow
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170829000000.000
      <TRNAMT>-3.76
      <FITID>238977258
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170829000000.000
      <TRNAMT>-5.19
      <FITID>238977259
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170830000000.000
      <TRNAMT>-7.65
      <FITID>238977260
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170830000000.000
      <TRNAMT>-3.55
      <FITID>238977261
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170831000000.000
      <TRNAMT>-8.19
      <FITID>239125912
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170831000000.000
      <TRNAMT>-3.76
      <FITID>239125913
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>CREDIT
      <DTPOSTED>20170831000000.000
      <TRNAMT>1903.13
      <FITID>239128431
      <NAME>Online Loan Payment From Share 0
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170831000000.000
      <TRNAMT>-6.28
      <FITID>239946724
      <NAME>SQU*SQ *COFFEE GALLERY 1979-1991
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170901000000.000
      <TRNAMT>-2.73
      <FITID>239946725
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170902000000.000
      <TRNAMT>-3.54
      <FITID>239946726
      <NAME>CHEVRON 0094614 1155 E BETTERAVI
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170902000000.000
      <TRNAMT>-17.23
      <FITID>239946727
      <NAME>UCSB UNIV CTR BOOKSTOR 551 UCEN 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170904000000.000
      <TRNAMT>-11.82
      <FITID>239946728
      <NAME>Amazon web services 440 Terry Av
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170904000000.000
      <TRNAMT>-19.13
      <FITID>239946729
      <NAME>LA SALSA 31039 3987 STATE ST STE
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170904000000.000
      <TRNAMT>-14.50
      <FITID>239946730
      <NAME>ROCKIN JUMP VACAVILLE 828 ALAMO 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170905000000.000
      <TRNAMT>-20.56
      <FITID>239946731
      <NAME>THAI CANTEEN RESTAURAN 117 E STR
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170905000000.000
      <TRNAMT>-10.13
      <FITID>239946732
      <NAME>EXXONMOBIL 99167355 3898 STATE S
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170905000000.000
      <TRNAMT>-1.94
      <FITID>240727195
      <NAME>TACO BELL #31416 840 FIFTH STREE
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170906000000.000
      <TRNAMT>-2.73
      <FITID>240727196
      <NAME>MCDONALD'S F12464 8390 ARROYO CI
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170906000000.000
      <TRNAMT>-6.89
      <FITID>240727197
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170906000000.000
      <TRNAMT>-3.76
      <FITID>240727198
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170906000000.000
      <TRNAMT>-1.74
      <FITID>240727199
      <NAME>JACK IN THE BOX 0364 2305 N Lake
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170907000000.000
      <TRNAMT>-2.19
      <FITID>240727200
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170907000000.000
      <TRNAMT>-7.92
      <FITID>240727201
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170907000000.000
      <TRNAMT>-3.76
      <FITID>240727202
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170908000000.000
      <TRNAMT>-3.97
      <FITID>240727203
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170908000000.000
      <TRNAMT>-1.20
      <FITID>240727204
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170908000000.000
      <TRNAMT>-7.65
      <FITID>240727205
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170908000000.000
      <TRNAMT>-6.60
      <FITID>240727206
      <NAME>SQU*SQ *COFFEE GALLERY 1979-1991
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170909000000.000
      <TRNAMT>-165.72
      <FITID>240727207
      <NAME>THE MENS WEARHOUSE #27 406 SOUTH
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170911000000.000
      <TRNAMT>-5.66
      <FITID>240727208
      <NAME>SQU*SQ *COFFEE GALLERY 2029 N. L
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170911000000.000
      <TRNAMT>-6.91
      <FITID>240727209
      <NAME>SQU*SQ *COFFEE GALLERY 1979-1991
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170911000000.000
      <TRNAMT>-14.00
      <FITID>241389968
      <NAME>PERCH 448 S HILL STREET SUITE LO
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170911000000.000
      <TRNAMT>-7.00
      <FITID>241389969
      <NAME>50796 - ONE WILSHIRE 624 S GRAND
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170912000000.000
      <TRNAMT>-5.78
      <FITID>241389970
      <NAME>EVEREST RESTAURANT 2314 LAKE AVE
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170912000000.000
      <TRNAMT>-5.41
      <FITID>241389971
      <NAME>ROUNDS PREMIUM BURGERS 46 N LAKE
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170912000000.000
      <TRNAMT>-6.80
      <FITID>241389972
      <NAME>City of SM-STRUCTUR 7 1685 MAIN 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170912000000.000
      <TRNAMT>-33.86
      <FITID>241389973
      <NAME>DIN TAI FUNG 177 CARUSO AVE GLEN
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170913000000.000
      <TRNAMT>-4.00
      <FITID>241389974
      <NAME>LAZ PARKING 670196 889 AMERICANA
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170913000000.000
      <TRNAMT>-21.12
      <FITID>241389975
      <NAME>URTH CAFFE VI (PASADEN 594 E COL
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170914000000.000
      <TRNAMT>-4.10
      <FITID>241389976
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170914000000.000
      <TRNAMT>-4.92
      <FITID>241389977
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170914000000.000
      <TRNAMT>-3.97
      <FITID>241389978
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170915000000.000
      <TRNAMT>-6.28
      <FITID>241389979
      <NAME>SQU*SQ *COFFEE GALLERY 1979-1991
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170916000000.000
      <TRNAMT>-100.00
      <FITID>241389980
      <NAME>WYCLIFFE BIBLE TRANSL 11221 John
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170916000000.000
      <TRNAMT>-5.35
      <FITID>241389981
      <NAME>SQ *JAMESON BROWN C 260 N ALLEN 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170918000000.000
      <TRNAMT>-94.50
      <FITID>242145876
      <NAME>STATE FARM INSURANCE 3 STATE FAR
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170918000000.000
      <TRNAMT>-6.28
      <FITID>242145877
      <NAME>SQU*SQ *COFFEE GALLERY 2029 N. L
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170918000000.000
      <TRNAMT>-7.42
      <FITID>242145878
      <NAME>CHICK-FIL-A #03349 1700 E COLORA
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170918000000.000
      <TRNAMT>-7.64
      <FITID>242145879
      <NAME>CARL'S JR #7406 790 LAKE ST PASA
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170918000000.000
      <TRNAMT>-8.94
      <FITID>242145880
      <NAME>PHAROS BURGER 1129 N GARFIELD AV
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170918000000.000
      <TRNAMT>-69.00
      <FITID>242145881
      <NAME>UCLA PHYSICIANS PAY 5767 W CENTU
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170918000000.000
      <TRNAMT>-6.60
      <FITID>242145882
      <NAME>SQU*SQ *COFFEE GALLERY 1979-1991
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170918000000.000
      <TRNAMT>-6.00
      <FITID>242145883
      <NAME>LUCKY BOY ENTERPRISE 531 E WALNU
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170918000000.000
      <TRNAMT>-83.70
      <FITID>242145884
      <NAME>UCLA HOSP PYMT 10920 WILSHIRE BL
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170919000000.000
      <TRNAMT>-5.69
      <FITID>242145885
      <NAME>JAMBA JUICE 0112 204 S LAKE AVE 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170919000000.000
      <TRNAMT>-5.90
      <FITID>242145886
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170920000000.000
      <TRNAMT>-1.20
      <FITID>242145887
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170920000000.000
      <TRNAMT>-3.80
      <FITID>242145888
      <NAME>JACK IN THE BOX 0364 2305 N Lake
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170921000000.000
      <TRNAMT>-32.75
      <FITID>242145889
      <NAME>TARGET 00008839 777 EAST COLORAD
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170921000000.000
      <TRNAMT>-5.35
      <FITID>242145890
      <NAME>SQ *JAMESON BROWN C 2245 EAST CO
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170921000000.000
      <TRNAMT>-38.84
      <FITID>242145891
      <NAME>VONS Store00021394 1390 N ALLEN 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170921000000.000
      <TRNAMT>-6.22
      <FITID>242145892
      <NAME>YOSHINOYA PASADENA 1441 E COLORA
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170922000000.000
      <TRNAMT>-6.28
      <FITID>242145893
      <NAME>SQU*SQ *COFFEE GALLERY 2029 N. L
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170923000000.000
      <TRNAMT>-8.69
      <FITID>242871337
      <NAME>CHICK-FIL-A #03349 1700 E COLORA
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170923000000.000
      <TRNAMT>-12.92
      <FITID>242871338
      <NAME>EL PATRON MEXICAN FOOD 2555 Lake
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170923000000.000
      <TRNAMT>-3.97
      <FITID>242871339
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170923000000.000
      <TRNAMT>-7.92
      <FITID>242871340
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170925000000.000
      <TRNAMT>-6.28
      <FITID>242871341
      <NAME>SQU*SQ *COFFEE GALLERY 2029 N. L
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170925000000.000
      <TRNAMT>-1.75
      <FITID>242871342
      <NAME>LA METRO MISSION STQPS 905 MERID
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170925000000.000
      <TRNAMT>-0.35
      <FITID>242871343
      <NAME>LA METRO-CIVIC CTR QPS 101 S HIL
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170925000000.000
      <TRNAMT>-13.87
      <FITID>242871344
      <NAME>SUBWAY 00478453 800 N ALAMEDA AV
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170926000000.000
      <TRNAMT>-6.50
      <FITID>242871345
      <NAME>SWORK COFFEE 2160 COLORADO BLVD 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170926000000.000
      <TRNAMT>-6.83
      <FITID>242871346
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170926000000.000
      <TRNAMT>-3.97
      <FITID>242871347
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170927000000.000
      <TRNAMT>-3.45
      <FITID>242871348
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170927000000.000
      <TRNAMT>-7.65
      <FITID>242871349
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170927000000.000
      <TRNAMT>-126.53
      <FITID>242871350
      <NAME>Amazon.com 440 Terry Ave N AMZN.
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170928000000.000
      <TRNAMT>-6.83
      <FITID>243102574
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170928000000.000
      <TRNAMT>-3.97
      <FITID>243102575
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170928000000.000
      <TRNAMT>-6.28
      <FITID>243102576
      <NAME>SQU*SQ *COFFEE GALLERY 2029 N. L
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170929000000.000
      <TRNAMT>-64.99
      <FITID>243102577
      <NAME>CHARTER COMMUNICATIONS 12405 Pow
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>CREDIT
      <DTPOSTED>20170929000000.000
      <TRNAMT>1216.93
      <FITID>243102836
      <NAME>Online Loan Payment From Share 0
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170930000000.000
      <TRNAMT>-4.95
      <FITID>243848214
      <NAME>SQU*SQ *JAMESON BROWN 2245 East 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20170930000000.000
      <TRNAMT>-4.47
      <FITID>243848215
      <NAME>MCDONALD'S F942 716 FAIR OAKS AV
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171002000000.000
      <TRNAMT>-9.84
      <FITID>243848216
      <NAME>CHARLIE'S TRIO 5769 NORTH HUNTIN
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171002000000.000
      <TRNAMT>-9.81
      <FITID>243848217
      <NAME>EVEREST RESTAURANT 2314 LAKE AVE
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171002000000.000
      <TRNAMT>-6.25
      <FITID>243848218
      <NAME>SQ *SQ *MANTRA COFFEE 615 N San 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171002000000.000
      <TRNAMT>-42.52
      <FITID>243848219
      <NAME>VONS Store00021394 1390 N ALLEN 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171003000000.000
      <TRNAMT>-0.56
      <FITID>243848220
      <NAME>Amazon web services 440 Terry Av
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171003000000.000
      <TRNAMT>-3.97
      <FITID>243848221
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171003000000.000
      <TRNAMT>-3.26
      <FITID>243848222
      <NAME>JACK IN THE BOX 3319 2125 N Wind
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171004000000.000
      <TRNAMT>-4.64
      <FITID>244501362
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171004000000.000
      <TRNAMT>-3.97
      <FITID>244501363
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171005000000.000
      <TRNAMT>-47.98
      <FITID>244501364
      <NAME>SPARK *CHRISTIANMING 5252 Edgewo
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171005000000.000
      <TRNAMT>-3.97
      <FITID>244501365
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171005000000.000
      <TRNAMT>-7.67
      <FITID>244501366
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171005000000.000
      <TRNAMT>-6.28
      <FITID>244501367
      <NAME>SQU*SQ *COFFEE GALLERY 2029 N. L
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171006000000.000
      <TRNAMT>-19.60
      <FITID>244501368
      <NAME>USPS PO 0501560802 2271 LAKE AVE
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171007000000.000
      <TRNAMT>-3.97
      <FITID>244501369
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171007000000.000
      <TRNAMT>-70.40
      <FITID>244501370
      <NAME>ATHENS SERVICES 14048 VALLEY BLV
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171007000000.000
      <TRNAMT>-6.84
      <FITID>244501371
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171009000000.000
      <TRNAMT>-6.28
      <FITID>244957042
      <NAME>SQU*SQ *COFFEE GALLERY 2029 N. L
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171009000000.000
      <TRNAMT>-3.49
      <FITID>244957043
      <NAME>FOOD4LESS #0327 1329 N LAKE AVE 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171009000000.000
      <TRNAMT>-28.50
      <FITID>244957044
      <NAME>GOLDEN CHINA RESTAU 1115 FAIR OA
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171009000000.000
      <TRNAMT>-31.01
      <FITID>244957045
      <NAME>CVS/PHARMACY #09694 900 N LAKE A
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171009000000.000
      <TRNAMT>-74.54
      <FITID>244957046
      <NAME>MASA OF ECHO PARK 1800 W SUNSET 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171009000000.000
      <TRNAMT>-4.45
      <FITID>244957047
      <NAME>STARBUCKS STORE 23004 743 N. Lak
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171010000000.000
      <TRNAMT>-10.05
      <FITID>244957048
      <NAME>VONS #2139 1390 N ALLEN AVE PASA
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171010000000.000
      <TRNAMT>-2.97
      <FITID>244957049
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171010000000.000
      <TRNAMT>-1.20
      <FITID>244957050
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171011000000.000
      <TRNAMT>-3.97
      <FITID>244957051
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171011000000.000
      <TRNAMT>-6.98
      <FITID>244957052
      <NAME>VONS #2139 1390 N ALLEN AVE PASA
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171012000000.000
      <TRNAMT>-7.95
      <FITID>244957053
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171012000000.000
      <TRNAMT>-8.21
      <FITID>244957054
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171016000000.000
      <TRNAMT>-14.99
      <FITID>245978258
      <NAME>STEAMGAMES.COM 10400 NE 4TH ST S
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171016000000.000
      <TRNAMT>-100.00
      <FITID>245978259
      <NAME>WYCLIFFE BIBLE TRANSL 11221 John
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171016000000.000
      <TRNAMT>-4.95
      <FITID>245978260
      <NAME>SQU*SQ *JAMESON BROWN 260 N. All
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171016000000.000
      <TRNAMT>-5.01
      <FITID>245978261
      <NAME>SQU*SQ *CAFE DE LECHE 2491-2501 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171016000000.000
      <TRNAMT>-7.64
      <FITID>245978262
      <NAME>EVEREST RESTAURANT 2314 LAKE AVE
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171017000000.000
      <TRNAMT>-50.00
      <FITID>245978263
      <NAME>THE PAINTED CABERNET 1229 STATE 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171018000000.000
      <TRNAMT>-6.45
      <FITID>245978264
      <NAME>JACK IN THE BOX 0364 2305 N Lake
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171018000000.000
      <TRNAMT>-7.12
      <FITID>245978265
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171019000000.000
      <TRNAMT>-6.28
      <FITID>246514236
      <NAME>SQ *SQ *COFFEE GALLERY 2029 N. L
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171020000000.000
      <TRNAMT>-7.67
      <FITID>246514237
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171020000000.000
      <TRNAMT>-3.97
      <FITID>246514238
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171020000000.000
      <TRNAMT>-55.88
      <FITID>246514239
      <NAME>ORIGINAL PEPPERS MEXIC 181 COLOR
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171020000000.000
      <TRNAMT>-43.15
      <FITID>246514240
      <NAME>Amazon.com 440 Terry Ave N AMZN.
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171021000000.000
      <TRNAMT>-20.50
      <FITID>246514241
      <NAME>237WEB STUDIO MOVIE GR 410 S MYR
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171021000000.000
      <TRNAMT>-4.45
      <FITID>246514242
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171021000000.000
      <TRNAMT>-3.97
      <FITID>246514243
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171021000000.000
      <TRNAMT>-3.56
      <FITID>246514244
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171023000000.000
      <TRNAMT>-5.78
      <FITID>246514245
      <NAME>EVEREST RESTAURANT 2314 LAKE AVE
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171023000000.000
      <TRNAMT>-5.00
      <FITID>246514246
      <NAME>LA METRO LAKE AVE SQPS 340 N LAK
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171023000000.000
      <TRNAMT>-5.10
      <FITID>246514247
      <NAME>SQU*SQ *JAMESON BROWN 2245 East 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171023000000.000
      <TRNAMT>-6.28
      <FITID>246514248
      <NAME>SQ *SQ *COFFEE GALLERY 2029 N. L
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171023000000.000
      <TRNAMT>-9.38
      <FITID>246514249
      <NAME>VONS #2139 1390 N ALLEN AVE PASA
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171024000000.000
      <TRNAMT>-3.97
      <FITID>246600399
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>CREDIT
      <DTPOSTED>20171024000000.000
      <TRNAMT>1120.43
      <FITID>246600650
      <NAME>Online Loan Payment From Share 0
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171024000000.000
      <TRNAMT>-2.39
      <FITID>247134500
      <NAME>DEL TACO 0058 844 E UNION ST PAS
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171025000000.000
      <TRNAMT>-5.65
      <FITID>247134501
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171025000000.000
      <TRNAMT>-2.46
      <FITID>247134502
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171026000000.000
      <TRNAMT>-3.97
      <FITID>247134503
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171026000000.000
      <TRNAMT>-6.84
      <FITID>247134504
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171027000000.000
      <TRNAMT>-6.28
      <FITID>247134505
      <NAME>SQ *SQ *COFFEE GALLERY 2029 N. L
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171027000000.000
      <TRNAMT>-10.49
      <FITID>247134506
      <NAME>ALDI 79116 2246 LAKE AVE. ALTADE
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171027000000.000
      <TRNAMT>-5.90
      <FITID>247134507
      <NAME>JACK IN THE BOX 0364 2305 N Lake
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171027000000.000
      <TRNAMT>-6.48
      <FITID>247134508
      <NAME>SQ *SQ *ROSE CITY COFF 281 N Mad
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171028000000.000
      <TRNAMT>-13.20
      <FITID>247134509
      <NAME>THE REYN COFFEE SHOP 635 N LAKE 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171030000000.000
      <TRNAMT>-10.86
      <FITID>247813895
      <NAME>SQ *SQ *ROSE CITY COFF 281 N Mad
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171030000000.000
      <TRNAMT>-64.99
      <FITID>247813896
      <NAME>CHARTER COMMUNICATIONS 12405 Pow
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171030000000.000
      <TRNAMT>-3.82
      <FITID>247813897
      <NAME>MCDONALD'S F942 716 FAIR OAKS AV
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171030000000.000
      <TRNAMT>-15.95
      <FITID>247813898
      <NAME>FAIR OAKS CAR WASH 2164 FAIR OAK
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171030000000.000
      <TRNAMT>-12.00
      <FITID>247813899
      <NAME>EL PATRON MEXICAN FOOD 2555 Lake
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171030000000.000
      <TRNAMT>-3.75
      <FITID>247813900
      <NAME>THE TRAILS CAFE 2333 FERN DELL D
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171031000000.000
      <TRNAMT>-3.97
      <FITID>247813901
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171031000000.000
      <TRNAMT>-4.93
      <FITID>247813902
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171031000000.000
      <TRNAMT>-33.25
      <FITID>247813903
      <NAME>GROUNDWORK COFFEE - N 11275 CHAN
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171031000000.000
      <TRNAMT>-7.34
      <FITID>247813904
      <NAME>CHIPOTLE 0929 246 SOUTH LAKE AVE
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171101000000.000
      <TRNAMT>-2.71
      <FITID>247813905
      <NAME>ALDI 79116 2246 LAKE AVE. ALTADE
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171101000000.000
      <TRNAMT>-7.67
      <FITID>247813906
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171101000000.000
      <TRNAMT>-3.97
      <FITID>247813907
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171102000000.000
      <TRNAMT>-5.76
      <FITID>247813908
      <NAME>ALDI 79116 2246 LAKE AVE. ALTADE
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171102000000.000
      <TRNAMT>-6.84
      <FITID>247813909
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171102000000.000
      <TRNAMT>-3.97
      <FITID>247813910
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171103000000.000
      <TRNAMT>-5.97
      <FITID>248447045
      <NAME>SQ *SQ *COFFEE GALLERY 2029 N. L
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171103000000.000
      <TRNAMT>-0.56
      <FITID>248447046
      <NAME>Amazon web services 440 Terry Av
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171103000000.000
      <TRNAMT>-6.87
      <FITID>248447047
      <NAME>EVEREST RESTAURANT 2314 LAKE AVE
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171104000000.000
      <TRNAMT>-3.97
      <FITID>248447048
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171104000000.000
      <TRNAMT>-7.94
      <FITID>248447049
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171106000000.000
      <TRNAMT>-13.80
      <FITID>248447050
      <NAME>WESTERN BAGEL TOO 10 513 NORTH H
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171106000000.000
      <TRNAMT>-26.95
      <FITID>248447051
      <NAME>AQUARIUM OF PACTIX 100 AQUARIUM 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171106000000.000
      <TRNAMT>-7.64
      <FITID>248447052
      <NAME>PHAROS BURGER 1129 N GARFIELD AV
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171106000000.000
      <TRNAMT>-24.58
      <FITID>248447053
      <NAME>THE DUDES BREWING CO 1840 W 208T
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171106000000.000
      <TRNAMT>-8.00
      <FITID>248447054
      <NAME>AQUARIUM PARKING GARAG 333 W OCE
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171106000000.000
      <TRNAMT>-6.28
      <FITID>248447055
      <NAME>SQ *SQ *COFFEE GALLERY 2029 N. L
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171107000000.000
      <TRNAMT>-7.06
      <FITID>248940490
      <NAME>TOMMY'S #30 170 N HILL AVENUE PA
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171107000000.000
      <TRNAMT>-6.84
      <FITID>248940491
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171107000000.000
      <TRNAMT>-3.97
      <FITID>248940492
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171108000000.000
      <TRNAMT>-42.42
      <FITID>248940493
      <NAME>TRADER JOE'S #171 QPS 467 ROSEME
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171108000000.000
      <TRNAMT>-3.97
      <FITID>248940494
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171108000000.000
      <TRNAMT>-7.94
      <FITID>248940495
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171109000000.000
      <TRNAMT>-3.97
      <FITID>248940496
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171110000000.000
      <TRNAMT>-5.10
      <FITID>248940497
      <NAME>SQU*SQ *JAMESON BROWN 260 N. All
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171111000000.000
      <TRNAMT>-5.97
      <FITID>249618010
      <NAME>SQ *SQ *COFFEE GALLERY 2029 N. L
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171111000000.000
      <TRNAMT>-4.37
      <FITID>249618011
      <NAME>RITE AID STORE - 5531 914 FAIR O
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171113000000.000
      <TRNAMT>-6.28
      <FITID>249618012
      <NAME>SQ *SQ *COFFEE GALLERY 2029 N. L
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171113000000.000
      <TRNAMT>-4.48
      <FITID>249618013
      <NAME>MCDONALD'S F942 716 FAIR OAKS AV
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171113000000.000
      <TRNAMT>-47.45
      <FITID>249618014
      <NAME>AROMA COFFEE TEA 4360 TUJUNGA AV
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171114000000.000
      <TRNAMT>-3.97
      <FITID>249618015
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171114000000.000
      <TRNAMT>-2.39
      <FITID>249618016
      <NAME>DEL TACO 0058 844 E UNION ST PAS
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171115000000.000
      <TRNAMT>-3.97
      <FITID>249618017
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171115000000.000
      <TRNAMT>-7.94
      <FITID>249618018
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171116000000.000
      <TRNAMT>-100.00
      <FITID>250199782
      <NAME>WYCLIFFE BIBLE TRANSL 11221 John
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171116000000.000
      <TRNAMT>-3.97
      <FITID>250199783
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171116000000.000
      <TRNAMT>-6.84
      <FITID>250199784
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171116000000.000
      <TRNAMT>-4.37
      <FITID>250199785
      <NAME>JACK IN THE BOX 0364 2305 N Lake
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171117000000.000
      <TRNAMT>-1.70
      <FITID>250199786
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171117000000.000
      <TRNAMT>-3.97
      <FITID>250199787
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171117000000.000
      <TRNAMT>-5.48
      <FITID>250199788
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171117000000.000
      <TRNAMT>-6.30
      <FITID>250199789
      <NAME>SQ *SQ *COFFEE GALLERY 1979-1991
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171118000000.000
      <TRNAMT>-9.63
      <FITID>250199790
      <NAME>SQ *SQ *GO BEYOND THE 7565 Lockh
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171118000000.000
      <TRNAMT>-16.38
      <FITID>250199791
      <NAME>SQ *SQ *LINCOLN BEER C 7565 Lock
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171120000000.000
      <TRNAMT>-5.55
      <FITID>250780909
      <NAME>SQU*SQ *JAMESON BROWN 2245 East 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171120000000.000
      <TRNAMT>-5.78
      <FITID>250780910
      <NAME>EVEREST RESTAURANT 2314 LAKE AVE
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171120000000.000
      <TRNAMT>-19.00
      <FITID>250780911
      <NAME>VONS #2139 1390 N ALLEN AVE PASA
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171120000000.000
      <TRNAMT>-20.82
      <FITID>250780912
      <NAME>VONS #2139 1390 N ALLEN AVE PASA
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171120000000.000
      <TRNAMT>-12.77
      <FITID>250780913
      <NAME>STARBUCKS BAG IAD 44844 Auto Pil
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171120000000.000
      <TRNAMT>-6.09
      <FITID>250780914
      <NAME>LAX AIRP CARLS JR 100 WORLD WAY 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171121000000.000
      <TRNAMT>-2.96
      <FITID>250780915
      <NAME>SQ *SQ *THE COFFEE PLA 5401 West
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171121000000.000
      <TRNAMT>-6.05
      <FITID>250780916
      <NAME>METRO 013-MEDICAL CENT 8810 ROCK
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171121000000.000
      <TRNAMT>-3.45
      <FITID>250780917
      <NAME>METRO 082-L'ENFANT PLZ 600 MARYL
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171122000000.000
      <TRNAMT>-10.10
      <FITID>250780918
      <NAME>NIH BLDG 10 B119062207 10 CENTER
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171122000000.000
      <TRNAMT>-10.12
      <FITID>250780919
      <NAME>NIH ACRF 10062719 10 CENTER DR B
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171122000000.000
      <TRNAMT>-9.75
      <FITID>250780920
      <NAME>LAXSHUTTLETIX.COM 2001 S. Manche
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171122000000.000
      <TRNAMT>-4.85
      <FITID>250780921
      <NAME>EURESTATRIUM 19061399 10 CENTER 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171122000000.000
      <TRNAMT>-5.19
      <FITID>250780922
      <NAME>STARBUCKS D15 IAD 44844 Auto Pil
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171122000000.000
      <TRNAMT>-6.30
      <FITID>250780923
      <NAME>SQ *SQ *COFFEE GALLERY 2029 N. L
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171123000000.000
      <TRNAMT>-8.10
      <FITID>250780924
      <NAME>PANDA EXPRESS #194 1216 FAIR OAK
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171124000000.000
      <TRNAMT>-6.48
      <FITID>250780925
      <NAME>SQU*SQ *ROSEBUD COFFEE 281 N Mad
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171124000000.000
      <TRNAMT>-60.41
      <FITID>250780926
      <NAME>MIMIS CAFE 9 500 W HUNTINGTON DR
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171125000000.000
      <TRNAMT>-10.75
      <FITID>251413072
      <NAME>SQ *SQ *MANTRA COFFEE 615 N San 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171125000000.000
      <TRNAMT>-30.43
      <FITID>251413073
      <NAME>TRADER JOE'S #171 QPS 467 ROSEME
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171127000000.000
      <TRNAMT>-8.90
      <FITID>251413074
      <NAME>STARBUCKS STORE 11603 4900 Topan
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171127000000.000
      <TRNAMT>-58.01
      <FITID>251413075
      <NAME>TARGET 00008839 777 EAST COLORAD
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171127000000.000
      <TRNAMT>-2.18
      <FITID>251413076
      <NAME>PEPBOYS STORE 607 1135 E COLORAD
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171127000000.000
      <TRNAMT>-6.30
      <FITID>251413077
      <NAME>SQ *SQ *COFFEE GALLERY 2029 N. L
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171127000000.000
      <TRNAMT>-49.10
      <FITID>251413078
      <NAME>SQU*SQ *ROSENTHAL WINE 3926 Old 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171127000000.000
      <TRNAMT>-27.50
      <FITID>251413079
      <NAME>AZTEC GOURMET FOOD 15455 CABRITO
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171127000000.000
      <TRNAMT>-6.30
      <FITID>251413080
      <NAME>SQ *SQ *COFFEE GALLERY 2029 N. L
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171128000000.000
      <TRNAMT>-5.80
      <FITID>251413081
      <NAME>CARL'S JR #7406 790 LAKE ST PASA
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171128000000.000
      <TRNAMT>-7.94
      <FITID>251413082
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171128000000.000
      <TRNAMT>-14.99
      <FITID>251413083
      <NAME>BLIZZARD ENTERTAINM 1 BLIZZARD W
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171128000000.000
      <TRNAMT>-3.97
      <FITID>251413084
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171129000000.000
      <TRNAMT>-64.99
      <FITID>251413085
      <NAME>CHARTER COMMUNICATIONS 12405 Pow
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171129000000.000
      <TRNAMT>-8.71
      <FITID>251413086
      <NAME>CHICK-FIL-A #03349 1700 E COLORA
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171129000000.000
      <TRNAMT>-6.23
      <FITID>251413087
      <NAME>RITE AID STORE - 5526 735 EAST A
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171129000000.000
      <TRNAMT>-59.27
      <FITID>251413088
      <NAME>ORIGINAL PEPPERS MEXIC 181 COLOR
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171129000000.000
      <TRNAMT>-9.58
      <FITID>251413089
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171130000000.000
      <TRNAMT>-36.97
      <FITID>252182118
      <NAME>RITE AID STORE - 5526 735 EAST A
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171130000000.000
      <TRNAMT>-3.97
      <FITID>252182119
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171130000000.000
      <TRNAMT>-9.58
      <FITID>252182120
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171201000000.000
      <TRNAMT>-8.50
      <FITID>252182121
      <NAME>SQU*SQ *JAMESON BROWN 260 N. All
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171202000000.000
      <TRNAMT>-9.78
      <FITID>252182122
      <NAME>FRIDA TACOS PASADEN 36 W COLORAD
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171202000000.000
      <TRNAMT>-6.84
      <FITID>252182123
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171204000000.000
      <TRNAMT>-5.06
      <FITID>252182124
      <NAME>BUTLERS COFFE 40125 10TH ST W ST
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171204000000.000
      <TRNAMT>-4.59
      <FITID>252371991
      <NAME>MCDONALD'S F804 799 N. LAKE AVE.
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171204000000.000
      <TRNAMT>-95.14
      <FITID>252371992
      <NAME>PARADISE COVE BEACH CA 28128 Pac
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171204000000.000
      <TRNAMT>-0.56
      <FITID>252371993
      <NAME>Amazon web services 440 Terry Av
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171204000000.000
      <TRNAMT>-28.00
      <FITID>252371994
      <NAME>ACADEMY TAILOR 23 N CATALINA AVE
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171204000000.000
      <TRNAMT>-2.74
      <FITID>252371995
      <NAME>MCDONALD'S F11949 2157 LINCOLN A
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171205000000.000
      <TRNAMT>-8.00
      <FITID>252371996
      <NAME>PARADISE COVE LAND COM 28128 PAC
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171205000000.000
      <TRNAMT>-6.84
      <FITID>252371997
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171205000000.000
      <TRNAMT>-3.77
      <FITID>252371998
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>CREDIT
      <DTPOSTED>20171205000000.000
      <TRNAMT>827.48
      <FITID>252372668
      <NAME>Online Loan Payment From Share 0
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171206000000.000
      <TRNAMT>-6.84
      <FITID>252891244
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171207000000.000
      <TRNAMT>-2.74
      <FITID>252891245
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171207000000.000
      <TRNAMT>-5.88
      <FITID>252891246
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171207000000.000
      <TRNAMT>-3.97
      <FITID>252891247
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171207000000.000
      <TRNAMT>-4.25
      <FITID>252891248
      <NAME>STARBUCKS STORE 23004 743 N. Lak
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171208000000.000
      <TRNAMT>-6.30
      <FITID>252891249
      <NAME>SQ *SQ *COFFEE GALLERY 2029 N. L
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171208000000.000
      <TRNAMT>-6.48
      <FITID>253564805
      <NAME>SQU*SQ *ROSEBUD COFFEE 281 N Mad
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171209000000.000
      <TRNAMT>-6.87
      <FITID>253564806
      <NAME>EVEREST RESTAURANT 2314 LAKE AVE
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171209000000.000
      <TRNAMT>-4.36
      <FITID>253564807
      <NAME>BURGER KING #9683 Q07 622 SOUTH 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171209000000.000
      <TRNAMT>-200.00
      <FITID>253564808
      <NAME>ONE STOP AUTO 2335 E FOOTHILL BL
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171209000000.000
      <TRNAMT>-13.90
      <FITID>253564809
      <NAME>TRADER JOE'S #179 QPS 345 SOUTH 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171211000000.000
      <TRNAMT>-4.37
      <FITID>253564810
      <NAME>TACO BELL #17451 1953 E COLORADO
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171211000000.000
      <TRNAMT>-28.62
      <FITID>253564811
      <NAME>RALPHS #0021 1745 GARFIELD SOUTH
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171211000000.000
      <TRNAMT>-10.94
      <FITID>253564812
      <NAME>LEE'S HOAGIE HOUSE 2269 E COLORA
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171211000000.000
      <TRNAMT>-75.00
      <FITID>253564813
      <NAME>UNITED 600 Jefferson Street 800-
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171211000000.000
      <TRNAMT>-75.00
      <FITID>253564814
      <NAME>UNITED 600 Jefferson Street 800-
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171211000000.000
      <TRNAMT>-75.00
      <FITID>253564815
      <NAME>UNITED 600 Jefferson Street 800-
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171211000000.000
      <TRNAMT>-75.00
      <FITID>253564816
      <NAME>UNITED 600 Jefferson Street 800-
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171211000000.000
      <TRNAMT>-11.20
      <FITID>253564817
      <NAME>UNITED 600 Jefferson Street 800-
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171211000000.000
      <TRNAMT>-5.60
      <FITID>253564818
      <NAME>UNITED 600 Jefferson Street 800-
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171211000000.000
      <TRNAMT>-11.20
      <FITID>253564819
      <NAME>UNITED 600 Jefferson Street 800-
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171211000000.000
      <TRNAMT>-177.70
      <FITID>253564820
      <NAME>CVS/PHARMACY #03968 816 E MAIN S
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171211000000.000
      <TRNAMT>-5.60
      <FITID>253564821
      <NAME>UNITED 600 Jefferson Street 800-
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171211000000.000
      <TRNAMT>-6.30
      <FITID>253564822
      <NAME>SQ *SQ *COFFEE GALLERY 2029 N. L
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171212000000.000
      <TRNAMT>-3.28
      <FITID>253564823
      <NAME>CARL'S JR #7406 790 LAKE ST PASA
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171212000000.000
      <TRNAMT>-3.97
      <FITID>253564824
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171213000000.000
      <TRNAMT>-2.74
      <FITID>253564825
      <NAME>MCDONALD'S F942 716 FAIR OAKS AV
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171213000000.000
      <TRNAMT>-10.99
      <FITID>253564826
      <NAME>NETFLIX.COM 100 Winchester Circl
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171213000000.000
      <TRNAMT>-3.97
      <FITID>253564827
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171213000000.000
      <TRNAMT>-4.93
      <FITID>253564828
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171213000000.000
      <TRNAMT>-3.26
      <FITID>254159313
      <NAME>JACK IN THE BOX 3319 2125 N Wind
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171214000000.000
      <TRNAMT>-4.93
      <FITID>254159314
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171214000000.000
      <TRNAMT>-5.18
      <FITID>254159315
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171215000000.000
      <TRNAMT>-6.30
      <FITID>254159316
      <NAME>SQ *SQ *COFFEE GALLERY 2029 N. L
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171216000000.000
      <TRNAMT>-3.81
      <FITID>254159317
      <NAME>JACK IN THE BOX 0364 2305 N Lake
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171216000000.000
      <TRNAMT>-100.00
      <FITID>254159318
      <NAME>WYCLIFFE BIBLE TRANSL 11221 John
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171216000000.000
      <TRNAMT>-4.11
      <FITID>254159319
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171216000000.000
      <TRNAMT>-4.65
      <FITID>254159320
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171216000000.000
      <TRNAMT>-3.97
      <FITID>254159321
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171218000000.000
      <TRNAMT>-5.65
      <FITID>254846284
      <NAME>SQU*SQ *JAMESON BROWN 2245 East 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171218000000.000
      <TRNAMT>-6.30
      <FITID>254846285
      <NAME>SQ *SQ *COFFEE GALLERY 2029 N. L
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171218000000.000
      <TRNAMT>-2.74
      <FITID>254846286
      <NAME>MCDONALD'S F13902 1306 N. ALTADE
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171218000000.000
      <TRNAMT>-9.35
      <FITID>254846287
      <NAME>ALDI 79116 2246 LAKE AVE. ALTADE
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171219000000.000
      <TRNAMT>-4.49
      <FITID>254846288
      <NAME>TOMMY'S #30 170 N HILL AVENUE PA
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171219000000.000
      <TRNAMT>-42.27
      <FITID>254846289
      <NAME>TRADER JOE'S #171 QPS 467 ROSEME
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171219000000.000
      <TRNAMT>-3.97
      <FITID>254846290
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171219000000.000
      <TRNAMT>-2.66
      <FITID>254846291
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171219000000.000
      <TRNAMT>-6.02
      <FITID>254846292
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171220000000.000
      <TRNAMT>-3.97
      <FITID>254846293
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171220000000.000
      <TRNAMT>-4.93
      <FITID>254846294
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171221000000.000
      <TRNAMT>-3.97
      <FITID>254846295
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171221000000.000
      <TRNAMT>-6.84
      <FITID>254846296
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171222000000.000
      <TRNAMT>-4.65
      <FITID>255455279
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171222000000.000
      <TRNAMT>-8.21
      <FITID>255455280
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171223000000.000
      <TRNAMT>-6.30
      <FITID>255455281
      <NAME>SQ *SQ *COFFEE GALLERY 2029 N. L
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171225000000.000
      <TRNAMT>-6.52
      <FITID>255455282
      <NAME>TOMMIES 6600 TOPANGA CYN BLVD D 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171225000000.000
      <TRNAMT>-12.68
      <FITID>255455283
      <NAME>MCDONALD'S F942 716 FAIR OAKS AV
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171225000000.000
      <TRNAMT>-54.68
      <FITID>255455284
      <NAME>CVS/PHARMACY #10785 16920 LINCOL
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171225000000.000
      <TRNAMT>-9.88
      <FITID>255455285
      <NAME>SUBWAY 04568853 7684 N WENATACHE
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171225000000.000
      <TRNAMT>-25.00
      <FITID>255455286
      <NAME>UNITED 600 Jefferson Street 800-
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171227000000.000
      <TRNAMT>-8.53
      <FITID>255557381
      <NAME>MCDONALD'S F13573 8900 PENA BLVD
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171227000000.000
      <TRNAMT>-17.06
      <FITID>255557382
      <NAME>BURGER KING #21655 Q07 SAN FRANC
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>CREDIT
      <DTPOSTED>20171227000000.000
      <TRNAMT>1797.81
      <FITID>255557989
      <NAME>Online Loan Payment From Share 0
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171227000000.000
      <TRNAMT>-4.99
      <FITID>256110125
      <NAME>PEETS COFFEE SFO #1 660 WEST FIE
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171228000000.000
      <TRNAMT>-2.03
      <FITID>256110126
      <NAME>EXPRESS MARKET CON B 8600 E PENA
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171228000000.000
      <TRNAMT>-25.00
      <FITID>256110127
      <NAME>UNITED 600 Jefferson Street 800-
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171228000000.000
      <TRNAMT>-59.96
      <FITID>256110128
      <NAME>HARRY DAVID #320 6600 Topanga Cy
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171228000000.000
      <TRNAMT>-3.48
      <FITID>256110129
      <NAME>MCDONALD'S F942 716 FAIR OAKS AV
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171228000000.000
      <TRNAMT>-14.99
      <FITID>256110130
      <NAME>BLIZZARD ENTERTAINM 1 BLIZZARD W
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171229000000.000
      <TRNAMT>-106.99
      <FITID>256110131
      <NAME>WALLYPARK- LAX 9700 BELLANCA AVE
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171229000000.000
      <TRNAMT>-64.99
      <FITID>256110132
      <NAME>CHARTER COMMUNICATIONS 12405 Pow
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171229000000.000
      <TRNAMT>-6.30
      <FITID>256110133
      <NAME>SQ *SQ *COFFEE GALLERY 2029 N. L
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171230000000.000
      <TRNAMT>-5.55
      <FITID>256110134
      <NAME>SQU*SQ *JAMESON BROWN 2245 East 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171230000000.000
      <TRNAMT>-5.67
      <FITID>256110135
      <NAME>SQ *SQ *COFFEE GALLERY 2029 N. L
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20171230000000.000
      <TRNAMT>-10.40
      <FITID>256110136
      <NAME>URBAN PLATES #11 269 S LAKE AVE 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180101000000.000
      <TRNAMT>-3.81
      <FITID>256912432
      <NAME>JACK IN THE BOX 0364 2305 N Lake
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180101000000.000
      <TRNAMT>-5.10
      <FITID>256912433
      <NAME>SQU*SQ *JAMESON BROWN 2245 East 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180101000000.000
      <TRNAMT>-6.45
      <FITID>256912434
      <NAME>EDWARDS ALHAMBRA RENAI 1 E MAIN 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180101000000.000
      <TRNAMT>-4.45
      <FITID>256912435
      <NAME>STARBUCKS STORE 23004 743 N. Lak
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180101000000.000
      <TRNAMT>-39.91
      <FITID>256912436
      <NAME>VONS #2139 1390 N ALLEN AVE PASA
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180103000000.000
      <TRNAMT>-6.30
      <FITID>256912437
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180103000000.000
      <TRNAMT>-11.89
      <FITID>256912438
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180103000000.000
      <TRNAMT>-3.77
      <FITID>256912439
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180103000000.000
      <TRNAMT>-12.52
      <FITID>256912440
      <NAME>VONS #2139 1390 N ALLEN AVE PASA
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180104000000.000
      <TRNAMT>-0.56
      <FITID>256912441
      <NAME>Amazon web services 440 Terry Av
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180104000000.000
      <TRNAMT>-6.30
      <FITID>256912442
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180104000000.000
      <TRNAMT>-3.97
      <FITID>256912443
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180105000000.000
      <TRNAMT>-3.97
      <FITID>256912444
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180105000000.000
      <TRNAMT>-6.84
      <FITID>256912445
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180105000000.000
      <TRNAMT>-47.97
      <FITID>256912446
      <NAME>CHRISTIANMINGLE 11150 Santa Moni
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180106000000.000
      <TRNAMT>-70.40
      <FITID>257476170
      <NAME>ATHENS SERVICES 14048 VALLEY BLV
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180108000000.000
      <TRNAMT>-7.65
      <FITID>257476171
      <NAME>CARLS JR GB 7406 790 N Lake Ave 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180108000000.000
      <TRNAMT>-6.61
      <FITID>257476172
      <NAME>SQ *SQ *COFFEE GALLERY 2029 N. L
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180109000000.000
      <TRNAMT>-4.04
      <FITID>257476173
      <NAME>DEL TACO 0058 844 E UNION ST PAS
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180109000000.000
      <TRNAMT>-10.03
      <FITID>257476174
      <NAME>SQU*SQ *JAMESON BROWN 2245 East 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180109000000.000
      <TRNAMT>-13.98
      <FITID>257476175
      <NAME>AMAZON MKTPLACE PMTS 440 Terry A
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180109000000.000
      <TRNAMT>-13.99
      <FITID>257476176
      <NAME>OH HAPPY DAYS HEALTH C 2283 LAKE
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180109000000.000
      <TRNAMT>-4.11
      <FITID>257476177
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180109000000.000
      <TRNAMT>-3.97
      <FITID>257476178
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180110000000.000
      <TRNAMT>-20.17
      <FITID>258028052
      <NAME>Amazon.com 440 Terry Ave N AMZN.
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180110000000.000
      <TRNAMT>-5.43
      <FITID>258028053
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180110000000.000
      <TRNAMT>-3.77
      <FITID>258028054
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180111000000.000
      <TRNAMT>-50.69
      <FITID>258028055
      <NAME>AMAZON MKTPLACE PMTS 440 Terry A
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180111000000.000
      <TRNAMT>-8.53
      <FITID>258028056
      <NAME>JACK IN THE BOX 0364 2305 N Lake
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180112000000.000
      <TRNAMT>-5.98
      <FITID>258028057
      <NAME>SQ *SQ *COFFEE GALLERY 2029 N. L
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180112000000.000
      <TRNAMT>-7.60
      <FITID>258028058
      <NAME>SQ *SQ *CHARLIE'S COFF 304 Pasad
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180112000000.000
      <TRNAMT>-17.00
      <FITID>258028059
      <NAME>Amazon web services 440 Terry Av
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180112000000.000
      <TRNAMT>-4.93
      <FITID>258028060
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180113000000.000
      <TRNAMT>-10.99
      <FITID>258028061
      <NAME>NETFLIX.COM 100 Winchester Circl
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180113000000.000
      <TRNAMT>-8.32
      <FITID>258028062
      <NAME>PANDA EXPRESS #194 1216 FAIR OAK
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180115000000.000
      <TRNAMT>-5.55
      <FITID>258636067
      <NAME>SQU*SQ *JAMESON BROWN 2245 East 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180115000000.000
      <TRNAMT>-4.15
      <FITID>258636068
      <NAME>HUNTING HOSP 60076296 100 W CALI
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180115000000.000
      <TRNAMT>-14.43
      <FITID>258636069
      <NAME>MCDONALD'S F942 716 FAIR OAKS AV
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180115000000.000
      <TRNAMT>-6.00
      <FITID>258636070
      <NAME>MODERN PARKING LOC 166 100 W CAL
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180115000000.000
      <TRNAMT>-2.69
      <FITID>258636071
      <NAME>HUNTING HOSP 60076296 100 W CALI
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180115000000.000
      <TRNAMT>-12.52
      <FITID>258636072
      <NAME>VONS #3075 1129 FAIR OAKS AVE ST
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180115000000.000
      <TRNAMT>-6.61
      <FITID>258636073
      <NAME>SQ *SQ *COFFEE GALLERY 2029 N. L
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180115000000.000
      <TRNAMT>-11.47
      <FITID>258636074
      <NAME>DENNY'S INC 18007336 2627 E COLO
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180116000000.000
      <TRNAMT>-18.69
      <FITID>258636075
      <NAME>VONS #2139 1390 N ALLEN AVE PASA
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180116000000.000
      <TRNAMT>-100.00
      <FITID>258636076
      <NAME>WYCLIFFE BIBLE TRANSL 11221 John
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180117000000.000
      <TRNAMT>-6.87
      <FITID>258636077
      <NAME>EVEREST RESTAURANT 2314 LAKE AVE
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180117000000.000
      <TRNAMT>-3.97
      <FITID>258636078
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180117000000.000
      <TRNAMT>-4.93
      <FITID>258636079
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180118000000.000
      <TRNAMT>-6.84
      <FITID>258636080
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180118000000.000
      <TRNAMT>-3.77
      <FITID>258636081
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180119000000.000
      <TRNAMT>-4.93
      <FITID>259264862
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180119000000.000
      <TRNAMT>-3.97
      <FITID>259264863
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180120000000.000
      <TRNAMT>-5.98
      <FITID>259264864
      <NAME>SQ *SQ *COFFEE GALLERY 2029 N. L
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180122000000.000
      <TRNAMT>-570.22
      <FITID>259264865
      <NAME>STATE FARM INSURANCE 3 STATE FAR
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180122000000.000
      <TRNAMT>-4.45
      <FITID>259264866
      <NAME>STARBUCKS STORE 00535 575 South 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180122000000.000
      <TRNAMT>-14.25
      <FITID>259264867
      <NAME>AMC SANTA ANITA 16 #02 400 BALDW
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180122000000.000
      <TRNAMT>-14.78
      <FITID>259264868
      <NAME>AMC SANTA ANITA 16 #02 400 BALDW
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180122000000.000
      <TRNAMT>-4.37
      <FITID>259264869
      <NAME>JACK IN THE BOX 0364 2305 N Lake
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180122000000.000
      <TRNAMT>-62.20
      <FITID>259264870
      <NAME>TRUE FOOD KITCHEN #101 168 W COL
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180123000000.000
      <TRNAMT>-1.99
      <FITID>259264871
      <NAME>VONS #2139 1390 N ALLEN AVE PASA
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180123000000.000
      <TRNAMT>-4.00
      <FITID>259264872
      <NAME>OLD PASADENA PARKING 33 E GREEN 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180123000000.000
      <TRNAMT>-3.97
      <FITID>259264873
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180123000000.000
      <TRNAMT>-3.58
      <FITID>259264874
      <NAME>DEL TACO 0058 844 E UNION ST PAS
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180124000000.000
      <TRNAMT>-3.37
      <FITID>259724631
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180124000000.000
      <TRNAMT>-7.67
      <FITID>259724632
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180125000000.000
      <TRNAMT>-4.93
      <FITID>259724633
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180125000000.000
      <TRNAMT>-3.97
      <FITID>259724634
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180125000000.000
      <TRNAMT>-4.38
      <FITID>259724635
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180126000000.000
      <TRNAMT>-14.99
      <FITID>259724636
      <NAME>BLIZZARD ENTERTAINM 1 BLIZZARD W
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180127000000.000
      <TRNAMT>-3.81
      <FITID>259724637
      <NAME>JACK IN THE BOX 0364 2305 N Lake
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180127000000.000
      <TRNAMT>-7.94
      <FITID>259724638
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>CREDIT
      <DTPOSTED>20180127000000.000
      <TRNAMT>1793.88
      <FITID>259725360
      <NAME>Online Loan Payment From Share 0
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180129000000.000
      <TRNAMT>-64.99
      <FITID>260285506
      <NAME>CHARTER COMMUNICATIONS 12405 Pow
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180129000000.000
      <TRNAMT>-18.73
      <FITID>260285507
      <NAME>SQU*SQ *DUPARS RESTAUR 141 South
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180129000000.000
      <TRNAMT>-6.00
      <FITID>260285508
      <NAME>SQU*SQ *JAMESON BROWN 2245 East 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180129000000.000
      <TRNAMT>-9.30
      <FITID>260285509
      <NAME>VONS #2139 1390 N ALLEN AVE PASA
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180130000000.000
      <TRNAMT>-6.84
      <FITID>260285510
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180130000000.000
      <TRNAMT>-3.97
      <FITID>260285511
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180131000000.000
      <TRNAMT>-6.16
      <FITID>260285512
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180131000000.000
      <TRNAMT>-4.03
      <FITID>260285513
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180201000000.000
      <TRNAMT>-9.73
      <FITID>261015146
      <NAME>RITE AID STORE - 5526 735 EAST A
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180201000000.000
      <TRNAMT>-45.00
      <FITID>261015147
      <NAME>RITE AID STORE - 5526 735 EAST A
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180201000000.000
      <TRNAMT>-58.00
      <FITID>261015148
      <NAME>NILOUFAR MOLAYEM DDS 1213 N. LAK
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180201000000.000
      <TRNAMT>-3.77
      <FITID>261015149
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180201000000.000
      <TRNAMT>-4.93
      <FITID>261015150
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180202000000.000
      <TRNAMT>-6.30
      <FITID>261015151
      <NAME>SQ *SQ *COFFEE GALLERY 1979-1991
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180202000000.000
      <TRNAMT>-6.00
      <FITID>261015152
      <NAME>SQU*SQ *JAMESON BROWN 260 N. All
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180203000000.000
      <TRNAMT>-6.34
      <FITID>261015153
      <NAME>JACK IN THE BOX 0364 2305 N Lake
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180203000000.000
      <TRNAMT>-21.88
      <FITID>261015154
      <NAME>ORCHARD SUPPLY #610 425 FAIR OAK
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180205000000.000
      <TRNAMT>-6.61
      <FITID>261015155
      <NAME>SQ *SQ *COFFEE GALLERY 2029 N. L
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180205000000.000
      <TRNAMT>-0.56
      <FITID>261015156
      <NAME>Amazon web services 440 Terry Av
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180205000000.000
      <TRNAMT>-7.99
      <FITID>261015157
      <NAME>LUCKY BOY HAMBURGERS I 640 S. AR
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180206000000.000
      <TRNAMT>-46.45
      <FITID>261789310
      <NAME>VONS #2139 1390 N ALLEN AVE PASA
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180206000000.000
      <TRNAMT>-4.76
      <FITID>261789311
      <NAME>UCLA R REAGAN DINE Q04 757 WESTW
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180206000000.000
      <TRNAMT>-3.97
      <FITID>261789312
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180206000000.000
      <TRNAMT>-12.00
      <FITID>261789313
      <NAME>UCLA PARKING SVCS 555 WESTWOOD P
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180207000000.000
      <TRNAMT>-6.84
      <FITID>261789314
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180207000000.000
      <TRNAMT>-3.46
      <FITID>261789315
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180208000000.000
      <TRNAMT>-4.93
      <FITID>261789316
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180208000000.000
      <TRNAMT>-3.77
      <FITID>261789317
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180209000000.000
      <TRNAMT>-6.30
      <FITID>261789318
      <NAME>SQ *SQ *COFFEE GALLERY 2029 N. L
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180210000000.000
      <TRNAMT>-3.97
      <FITID>261789319
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180210000000.000
      <TRNAMT>-7.94
      <FITID>261789320
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180212000000.000
      <TRNAMT>-1.08
      <FITID>262542618
      <NAME>FOOD4LESS #0327 1329 N LAKE AVE 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180212000000.000
      <TRNAMT>-2.58
      <FITID>262542619
      <NAME>ALDI 79116 2246 LAKE AVE. ALTADE
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180212000000.000
      <TRNAMT>-78.82
      <FITID>262542620
      <NAME>Amazon.com 440 Terry Ave N AMZN.
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180212000000.000
      <TRNAMT>-31.85
      <FITID>262542621
      <NAME>GREAT MAPLE PASADE 300 E COLORAD
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180212000000.000
      <TRNAMT>-6.61
      <FITID>262542622
      <NAME>SQ *SQ *COFFEE GALLERY 2029 N. L
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180212000000.000
      <TRNAMT>-5.16
      <FITID>262542623
      <NAME>RALPHS #0049 10455 SUNLAND BLVD 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180213000000.000
      <TRNAMT>-11.98
      <FITID>262542624
      <NAME>JUICE IT UP - LA CRESC 3231 FOOT
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180213000000.000
      <TRNAMT>-10.99
      <FITID>262542625
      <NAME>NETFLIX.COM 100 Winchester Circl
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180213000000.000
      <TRNAMT>-6.84
      <FITID>262542626
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180213000000.000
      <TRNAMT>-3.77
      <FITID>262542627
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180214000000.000
      <TRNAMT>-54.73
      <FITID>262542628
      <NAME>MARSHALLS #0208 3855 E FOOTHILL 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180215000000.000
      <TRNAMT>-97.32
      <FITID>262542629
      <NAME>STATE FARM INSURANCE 3 STATE FAR
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180215000000.000
      <TRNAMT>-3.77
      <FITID>262542630
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180215000000.000
      <TRNAMT>-4.93
      <FITID>262542631
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180215000000.000
      <TRNAMT>-3.97
      <FITID>262542632
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180215000000.000
      <TRNAMT>-8.49
      <FITID>262542633
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180216000000.000
      <TRNAMT>-6.30
      <FITID>262598564
      <NAME>SQ *SQ *COFFEE GALLERY 2029 N. L
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180216000000.000
      <TRNAMT>-100.00
      <FITID>262598565
      <NAME>WYCLIFFE BIBLE TRANSL 11221 John
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180216000000.000
      <TRNAMT>-3.56
      <FITID>263189540
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180216000000.000
      <TRNAMT>-8.21
      <FITID>263189541
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180217000000.000
      <TRNAMT>-8.80
      <FITID>263189542
      <NAME>SQU*SQ *JAMESON BROWN 2245 East 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180217000000.000
      <TRNAMT>-345.00
      <FITID>263189543
      <NAME>UCLA PHYSICIANS PAY 5767 W CENTU
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180219000000.000
      <TRNAMT>-12.26
      <FITID>263189544
      <NAME>LEMONADE PASADENA 146 S Lake Ave
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180219000000.000
      <TRNAMT>-4.50
      <FITID>263189545
      <NAME>SQ *SQ *BAD ASS COFFEE 11460 Ken
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180219000000.000
      <TRNAMT>-5.60
      <FITID>263189546
      <NAME>FIVE GUYS CA 1581 QSR 12719 MAIN
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180219000000.000
      <TRNAMT>-8.16
      <FITID>263189547
      <NAME>MEDITERRANEAN GRILL 105 N HILL A
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180220000000.000
      <TRNAMT>-42.11
      <FITID>263338361
      <NAME>VONS #2139 1390 N ALLEN AVE PASA
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180221000000.000
      <TRNAMT>-12.49
      <FITID>263338362
      <NAME>RALPHS #0096 160 N LAKE AVE PASA
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180221000000.000
      <TRNAMT>-6.16
      <FITID>263338363
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>DEBIT
      <DTPOSTED>20180221000000.000
      <TRNAMT>-3.82
      <FITID>263338364
      <NAME>CULINART OF CALIFORNIA 4800 OAK 
<MEMO>Card Loan Advance MC Credit Card
     </STMTTRN>
     <STMTTRN>
      <TRNTYPE>CREDIT
      <DTPOSTED>20180221000000.000
      <TRNAMT>1329.97
      <FITID>263338681
      <NAME>Online Loan Payment From Share 0
     </STMTTRN>
    </BANKTRANLIST>
    <LEDGERBAL>
     <BALAMT>-22.47
     <DTASOF>20180221165751.571
    </LEDGERBAL>
   </CCSTMTRS>
  </CCSTMTTRNRS>
 </CREDITCARDMSGSRSV1>
</OFX>`;
ElemTransactionList._getTransactionsFromOFX(text);
