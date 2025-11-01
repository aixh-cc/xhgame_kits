import * as path from 'path';

export const getPluginPath = (pluginName: string) => {
    if (typeof Editor != 'undefined' && Editor.Project) {
        return path.join(Editor.Project.path, 'extensions', pluginName);
    } else {
        return process.cwd();
    }
};

// 获取项目根目录下的 packages 路径
export const getPackagesPath = (pluginName: string, target: string = 'packages') => {
    let pluginPath = getPluginPath(pluginName);
    return path.join(pluginPath, 'assets', target);
};

export const getExtensionsPath = (pluginName: string) => {
    let pluginPath = getPluginPath(pluginName);
    return path.resolve(pluginPath, '../');
};

export const getProjectPath = (pluginName: string) => {
    let pluginPath = getPluginPath(pluginName);
    return path.resolve(pluginPath, '../../');
};