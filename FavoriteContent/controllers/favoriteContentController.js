angular.module("umbraco").controller("favorite.content.controller", 
function($scope, $http, $timeout, editorState, contentEditingHelper) {

    // Initialization Methods //////////////////////////////////////////////////

	/**
    * Triggered on the controller loaded, kicks off any initialization functions.
	*/
	$scope.init = function() {
        $scope.model.hideLabel = true;
        $scope.favoritedProperties = [];
        $scope.properties = [];
        $scope.watchers = [];
        $scope.getFavoritedPropertiesFromApi(function() {
            $scope.syncAllPropertiesToFavoriteContent();
            $scope.addFavoriteButtons();
            $scope.bindWatchValues();
            $timeout(function() {
                $scope.bindOnFavoriteClick();
                $scope.bindTabChange();
            }, 100);
        });
    };

    // Event Handler Methods /s//////////////////////////////////////////////////

    /**
     * Binds the favorite buttons' click event to allow the toggling of the 
     * favorites.
     */
    $scope.bindOnFavoriteClick = function() {
        jQuery('.orc-fav.fav-button').unbind('click');
        jQuery('.orc-fav.fav-button').on('click', function(e) {
            e.preventDefault();
            $scope.togglePropertyFavoriteStatus($(this)[0]);
            $scope.properties = [];
            $scope.syncAllPropertiesToFavoriteContent();
            $scope.bindWatchValues();
            $timeout(function() {
                $scope.bindOnFavoriteClick();
            }, 100);
        });
    };

    /**
     * Binds the tab changing functionality, which is the most convenient way 
     * to permit rebinding of values back into the favorite content tab when 
     * it's next exposed, particularly for stuff like the rich text editor.
     */
    $scope.bindTabChange = function() {
        $('a[data-toggle="tab"]').on('shown', function(e) {
            if ($scope.isOnFavoriteTab()) { 
                $scope.properties = [];
                $timeout(function() {
                    $scope.syncAllPropertiesToFavoriteContent();
                    $timeout(function() {
                        $scope.bindOnFavoriteClick();
                    }, 100);
                }, 100);
            } else {
                $scope.updateRtePropertiesWorkaround();
            }
        });
    };

    /**
     * Watches for changes in the values of the property editors of the 
     * favorite content tab, and updates accordingly.
     */
    $scope.bindWatchValues = function() {
        $scope.watchers.forEach(function(watcher) {
            watcher();
        });
        $scope.watchers = [];
        $scope.properties.forEach(function (prop, index) {
            var watcher = $scope.$watch('properties[' + index + '].value', function(newValue, oldValue) {
                if (!!newValue && !!oldValue) {
                    $scope.syncFavoriteContentToProperty(index);
                }
            });
            $scope.watchers.push(watcher);
        });
    };

    $scope.onSortUpClick = function(event, prop) {
        event.preventDefault();
        console.info('up');
        console.info(prop);
        /*/FavoriteContent/UpdatePropertySortOrder?property=NAME&sortOrder=NUMBER*/
    };

    $scope.onSortDownClick = function(event) {
        event.preventDefault();
        console.info('down'); 
    };

    // Helper Methods //////////////////////////////////////////////////////////

    /**
     * Adds the alias for the property to a backend favorites DB via API call.
     * @param {string} alias - The alias of the property to favorite
     * @param {()=>{}=} callback - Optional callback function after API 
     * response.
     */
    $scope.addPropertyToFavoriteViaApi = function(alias, callback) {
        $http.get('/umbraco/backoffice/api/FavoriteContent/AddPropertyToFavorites?property=' + alias).then(function(response) {
            if (callback) {
                callback();
            }
        });
    };

    /**
     * Adds favorite buttons to all property editors for use in add/remove 
     * favorites.
     */
    $scope.addFavoriteButtons = function() {
        var clonedContent = editorState.getCurrent();
        clonedContent.properties.forEach(function(property) {
            if ($scope.doesPropPassFilter(property.view)) {
                var buttonClass = 'orc-fav fav-button' + ($scope.isPropFavorite(property.alias) ? ' orc-fav-favorited': '') + ' alias--' + property.alias + '--';
                var buttonHtml = '<a class="' + buttonClass + '"><i class="icon-favorite" style="font-size: 1em"></i></a><span> </span>';
                property.description = buttonHtml + (property.description ? property.description : '');
            }
        });
        if (clonedContent && clonedContent.tabs) {
            clonedContent.tabs.forEach(function(tab) {
                tab.properties.forEach(function(property) {
                    if ($scope.doesPropPassFilter(property.view)) {
                        var buttonClass = 'orc-fav fav-button' + ($scope.isPropFavorite(property.alias) ? ' orc-fav-favorited': '') + ' alias--' + property.alias + '--';
                        var buttonHtml = '<a class="' + buttonClass + '"><i class="icon-favorite" style="font-size: 1em"></i></a><span> </span>';                
                        property.description = buttonHtml + (property.description ? property.description : '');
                    }
                });
            });
        }
        contentEditingHelper.reBindChangedProperties(editorState.getCurrent(), clonedContent);
    };

    $scope.doesPropPassFilter = function(view) {
        var shouldFilter = $scope.model.config.filterByList == "1";
        var useBlacklist = $scope.model.config.useBlacklist == "1";
        var permitted = $scope.model.config.permittedEditorViews.split(',');
        if (!shouldFilter || !permitted) {
            return true;
        }
        var doesPass = useBlacklist;
        permitted.forEach(function(item) {
            if (item.split(' ').join('') == view.split(' ').join('')) {
                doesPass = !doesPass;
            }
        });
        return doesPass;
    };

    /**
     * Makes an API call to a custom endpoint to get a list of favorited 
     * properties.
     * @param {()=>{}} callback - Triggered after the API call is completed.
     */
    $scope.getFavoritedPropertiesFromApi = function(callback) {
        // uncomment when API is created.
        $http.get('/umbraco/backoffice/api/FavoriteContent/GetFavoriteProperties').then(function(response) {
            var faves = response.data;
            var filtered = [];
            faves.forEach(function(fave, index) {
                var isUnique = true;
                faves.forEach(function(compareFave, compareIndex) {
                    if (fave.name === compareFave.name && index !== compareIndex && compareIndex < index) {
                        isUnique = false;
                    }
                });
                if (isUnique) {
                    filtered.push(fave);
                }
            })
            $scope.favoritedProperties = filtered;
            $scope.sortFavoritedProperties();
            callback();
        });
    };

    $scope.isOnFavoriteTab = function() {
        return jQuery('.umb-tab-pane.active .orc-fav-content-container').length > 0;
    };

    /**
     * Returns `true` if property alias provided matches one in the array of 
     * favoritedProperties.
     * @param {string} alias
     * @returns {boolean}
     */
    $scope.isPropFavorite = function(alias) {
        var isPropFavorite = false;
        $scope.favoritedProperties.forEach(function(prop) {
            if (prop.name === alias) {
                isPropFavorite = true;
            }
        });
        return isPropFavorite;
    };

    $scope.removePropertyFromFavoritesViaApi = function(alias, callback) {
        $http.get('/umbraco/backoffice/api/FavoriteContent/removePropertyFromFavorites?property=' + alias).then(function(response) {
            if (callback) {
                callback();
            }
        });
    };

    /**
     * Sorts the $scope.favoritedProperties array by its items sortOrder property.
     */
    $scope.sortFavoritedProperties = function() {
        var compare = function(a, b) {
            if (a.sortOrder < b.sortOrder) {
                return -1;
            } else if (a.sortOrder > b.sortOrder) {
                return 1;
            }
            return 0;
        };
        $scope.favoritedProperties.sort(compare);
    };

    /**
     * Iterates through `$scope.favoritedProperties` and updates `$scope.properties`
     * with the values of the matching content node properties.
     * @returns {void} void
     */
    $scope.syncAllPropertiesToFavoriteContent = function() {
        var props = contentEditingHelper.getAllProps(editorState.getCurrent());
        $scope.favoritedProperties.forEach(function(fave) {
            props.forEach(function(property) {
                if (property.alias === fave.name && $scope.doesPropPassFilter(property.view)) {
                    // Workarounds / fixes
                    property = $scope.fixTagsPropertyWorkaround(property);
                    $scope.properties.push(property);
                }
            }.bind($scope));
        }.bind($scope));
    };

    /**
     * Syncs the current value of a favorite content property editor to its
     * actual version on the content node.
     * @param {number} index
     */
    $scope.syncFavoriteContentToProperty = function(index) {
        var alias = $scope.favoritedProperties[index].name;
        var clonedContent = editorState.getCurrent();
        clonedContent.properties.forEach(function(property) {
            if (property.alias === alias && $scope.doesPropPassFilter(property.view)) {
                property.value = $scope.properties[index].value;
            }
        });
        clonedContent.tabs.forEach(function(tab) {
            tab.properties.forEach(function(property) {
                if (property.alias === alias && $scope.doesPropPassFilter(property.view)) {
                    property.value = $scope.properties[index].value;
                }
            });
        });
        contentEditingHelper.reBindChangedProperties(editorState.getCurrent(), clonedContent);
    };

    /** 
     * Adds or removes the property with the matching alias found inside the 
     * provided button element's class attribute to `$scope.favoritedProperties`.
     * @param {Element} button - A favorite button associated with a property.
     * @returns {void} void
     */
    $scope.togglePropertyFavoriteStatus = function(button) {
        var buttonClass = button.getAttribute('class');
        var alias = buttonClass.split('alias--')[1].split('--')[0];
        var isFavorited = buttonClass.indexOf('orc-fav-favorited') > -1;

        if (isFavorited) {
            $scope.favoritedProperties.forEach(function(property, index) {
                if (property.name === alias) {
                    $scope.favoritedProperties.splice(index, 1);
                }
            })
            $scope.removePropertyFromFavoritesViaApi(alias);
        } else {
            $scope.favoritedProperties.push({
                name: alias,
                isFavorite: true
            });
            $scope.addPropertyToFavoriteViaApi(alias);
        }

        var clonedContent = editorState.getCurrent();
        clonedContent.properties.forEach(function(property) {
            if (property.alias == alias) {
                if (isFavorited) {
                    property.description = property.description.split(' orc-fav-favorited').join('');
                } else {
                    property.description = property.description.split('orc-fav fav-button').join('orc-fav fav-button orc-fav-favorited');
                }
            }
        });
        clonedContent.tabs.forEach(function(tab) {
            tab.properties.forEach(function(property) {
                if (property.alias == alias) {
                    if (isFavorited) {
                        property.description = property.description.split(' orc-fav-favorited').join('');
                    } else {
                        property.description = property.description.split('orc-fav fav-button').join('orc-fav fav-button orc-fav-favorited');
                    }
                }
            });
        });
        contentEditingHelper.reBindChangedProperties(editorState.getCurrent(), clonedContent);
    };

    // Polyfills and workarounds ///////////////////////////////////////////////

    /**
     * Fixes an issue with Json-style Tag editors (the default) being mistyped 
     * as Csv.
     * @param {JSON} property - The property
     * @returns {JSON} property
     */
    $scope.fixTagsPropertyWorkaround = function(property) {
        if (property.editor === 'Umbraco.Tags' && property.config.storageType === 'Csv') {
            property.config.storageType = 'Json';
        }
        return property;
    };

    $scope.updateRtePropertiesWorkaround = function(property) {
        $scope.properties.forEach(function(property) {
            if (property.view === 'rte') {
                tinyMCE.editors.forEach(function(editor) {
                    if (editor.id.indexOf(property.alias) > -1) {
                        editor.setContent(property.value);
                    }
                });
            }
        });
    };

	// Call $scope.init() //////////////////////////////////////////////////////

    $scope.init();

});
