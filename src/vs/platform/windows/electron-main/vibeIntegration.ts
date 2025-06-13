/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { BrowserWindow } from 'electron';
import { isWindows } from '../../../base/common/platform.js';
import { WindowsMaterial } from '../../window/common/window.js';
const vibe = require('@pyke/vibe');


/**
 * Apply vibe effects to a window if available, otherwise fall back to native Electron materials
 */
export function applyVibeEffect(window: BrowserWindow, material: WindowsMaterial, tintColor?: string): boolean {
	if (!isWindows || !vibe) {
		return false;
	}

	try {
		switch (material) {
			case WindowsMaterial.MICA:
				// Check if system supports Mica
				if (vibe.platform.isWin11()) {
					vibe.applyEffect(window, 'mica');
					return true;
				}
				break;

			case WindowsMaterial.ACRYLIC:
				// Check if system supports Acrylic
				if (vibe.platform.isWin10_1809() || vibe.platform.isWin11()) {
					if (tintColor && !vibe.platform.isWin11_22H2()) {
						// Windows 10 supports tinting
						vibe.applyEffect(window, 'acrylic', tintColor);
					} else {
						// Windows 11 22H2+ uses Fluent Acrylic (no tinting)
						vibe.applyEffect(window, 'acrylic');
					}
					return true;
				}
				break;

			case WindowsMaterial.TABBED:
				// Tabbed is a Windows 11 22H2+ feature - use acrylic as fallback
				if (vibe.platform.isWin11_22H2()) {
					vibe.applyEffect(window, 'acrylic');
					return true;
				} else if (vibe.platform.isWin10_1809()) {
					vibe.applyEffect(window, 'acrylic', tintColor);
					return true;
				}
				break;
		}
	} catch (error) {
		console.error('Failed to apply vibe effect:', error);
	}

	return false;
}

/**
 * Clear all vibe effects from a window
 */
export function clearVibeEffects(window: BrowserWindow): void {
	if (!isWindows || !vibe) {
		return;
	}

	try {
		vibe.clearEffects(window);
	} catch (error) {
		console.error('Failed to clear vibe effects:', error);
	}
}

/**
 * Check if vibe is available and functional
 */
export function isVibeAvailable(): boolean {
	return isWindows && vibe !== null;
}

/**
 * Get platform capabilities for vibe effects
 */
export function getVibePlatformInfo() {
	if (!isWindows || !vibe) {
		return {
			isWin10_1809: false,
			isWin11: false,
			isWin11_22H2: false,
			supportsAcrylic: false,
			supportsMica: false,
			supportsTinting: false
		};
	}

	try {
		const isWin10_1809 = vibe.platform.isWin10_1809();
		const isWin11 = vibe.platform.isWin11();
		const isWin11_22H2 = vibe.platform.isWin11_22H2();

		return {
			isWin10_1809,
			isWin11,
			isWin11_22H2,
			supportsAcrylic: isWin10_1809 || isWin11,
			supportsMica: isWin11,
			supportsTinting: isWin10_1809 && !isWin11_22H2
		};
	} catch (error) {
		console.error('Failed to get vibe platform info:', error);
		return {
			isWin10_1809: false,
			isWin11: false,
			isWin11_22H2: false,
			supportsAcrylic: false,
			supportsMica: false,
			supportsTinting: false
		};
	}
}
