/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { createStyleSheet } from '../../../../base/browser/domStylesheets.js';
import { Event } from '../../../../base/common/event.js';
import { Disposable, DisposableStore, toDisposable } from '../../../../base/common/lifecycle.js';
import { clamp } from '../../../../base/common/numbers.js';
import { isWindows } from '../../../../base/common/platform.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { WindowsMaterial } from '../../../../platform/window/common/window.js';

export class BlurEffectContribution extends Disposable implements IWorkbenchContribution {
	static readonly ID = 'workbench.contrib.blurEffect';

	private _styleElement?: HTMLStyleElement;
	private _styleElementDisposables: DisposableStore | undefined = undefined;

	constructor(
		@IConfigurationService private readonly configurationService: IConfigurationService,
	) {
		super();

		this._register(toDisposable(() => this._removeStyleElement()));

		this._register(Event.runAndSubscribe(configurationService.onDidChangeConfiguration, e => {
			if (e && !e.affectsConfiguration('window.blur.enabled') && !e.affectsConfiguration('window.blur.radius')) {
				return;
			}

			this._updateBlurStyles();
		}));
	}

	private _updateBlurStyles(): void {
		let cssTextContent = '';

		const enabled = this._ensureBoolean(this.configurationService.getValue('window.blur.enabled'), false);
		if (enabled) {
			const shouldUseCSSBlur = !isWindows || !this._isWindows11OrLater() || !this._hasNativeMaterialSupport();

			if (shouldUseCSSBlur) {
				const radius = clamp(
					this._ensureNumber(this.configurationService.getValue('window.blur.radius'), 10),
					1,
					50
				);

				const blurRule = `backdrop-filter: blur(${radius}px);`;
				const rules = new Set<string>();


				const transparentPixel = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAQAAAAnOwc2AAAAEUlEQVR42mNkMGbAAIxDWRAA53ICCfFVYK4AAAAASUVORK5CYII=';

				rules.add(`.monaco-workbench .part.titlebar { ${blurRule} background-image: url("${transparentPixel}"); background-repeat: repeat; !important; }`);
				rules.add(`.monaco-workbench .part.activitybar { ${blurRule} background-image: url("${transparentPixel}"); background-repeat: repeat; !important; }`);
				rules.add(`.monaco-workbench .part.sidebar { ${blurRule} background-image: url("${transparentPixel}"); background-repeat: repeat; !important; }`);
				rules.add(`.monaco-workbench .part.panel { ${blurRule} background-image: url("${transparentPixel}"); background-repeat: repeat; !important; }`);
				rules.add(`.monaco-workbench .part.statusbar { ${blurRule} background-image: url("${transparentPixel}"); background-repeat: repeat; !important; }`);
				rules.add(`.monaco-workbench .part.editor { ${blurRule} background-image: url("${transparentPixel}"); background-repeat: repeat; !important; }`);


				rules.add(`.monaco-workbench::before {
								content: '';
								position: fixed;
								top: 0;
								left: 0;
								right: 0;
								bottom: 0;
								${blurRule}
								background-image: url("${transparentPixel}");
								background-repeat: repeat;
								pointer-events: none;
								z-index: -1;
								!important;
							}`
				);

				rules.add(`.quick-input-widget { ${blurRule} background-image: url("${transparentPixel}"); background-repeat: repeat; !important; }`);

				cssTextContent = [...rules].join('\n');
			}
		}

		if (cssTextContent.length === 0) {
			this._removeStyleElement();
		} else {
			this._getStyleElement().textContent = cssTextContent;
		}
	}

	private _isWindows11OrLater(): boolean {
		return isWindows;
	}

	private _hasNativeMaterialSupport(): boolean {
		const windowsMaterial = this.configurationService.getValue('window.blur.windowsMaterial') as WindowsMaterial;
		return windowsMaterial !== WindowsMaterial.NONE && this._isWindows11OrLater();
	}

	private _getStyleElement(): HTMLStyleElement {
		if (!this._styleElement) {
			this._styleElementDisposables = new DisposableStore();
			this._styleElement = createStyleSheet(undefined, undefined, this._styleElementDisposables);
			this._styleElement.className = 'blurEffect';
		}
		return this._styleElement;
	}

	private _removeStyleElement(): void {
		this._styleElementDisposables?.dispose();
		this._styleElementDisposables = undefined;
		this._styleElement = undefined;
	}

	private _ensureBoolean(value: unknown, defaultValue: boolean): boolean {
		return typeof value === 'boolean' ? value : defaultValue;
	}

	private _ensureNumber(value: unknown, defaultValue: number): number {
		return typeof value === 'number' ? value : defaultValue;
	}
}
