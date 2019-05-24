import FontMetrics from 'fontmetrics';

document.fonts.ready.then(() => {
	const metrics = FontMetrics({
		fontFamily: 'Muli',
		// Optional (defaults)
		fontWeight: 'normal',
		fontSize: '100',
		origin: 'baseline'
	});
	console.log(metrics);
	const fontMetricsElem = document.createElement('style');
	fontMetricsElem.id = 'FontMetrics';
	fontMetricsElem.innerHTML = `
		:root {
			--font-cap-height: ${-metrics.capHeight};
			--font-x-height: ${-metrics.xHeight};
			--font-baseline: ${-metrics.baseline};
		}
		`;
	document.head.appendChild(fontMetricsElem);
});
