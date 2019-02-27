angular.module("umbraco").controller("favorite.content.controller", 
function($scope, $http, $timeout, editorState, contentEditingHelper) {

    // Initialization Methods //////////////////////////////////////////////////

	/**
    * Triggered on the controller loaded, kicks off any initialization functions.
	*/
	$scope.init = function() {
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

    // Event Handler Methods ///////////////////////////////////////////////////

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
            $scope.properties = [];
            $timeout(function() {
                $scope.syncAllPropertiesToFavoriteContent();
                $timeout(function() {
                    $scope.bindOnFavoriteClick();
                }, 100);
            }, 100);
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
    }

    // Helper Methods //////////////////////////////////////////////////////////

    /**
     * Adds the alias for the property to a backend favorites DB via API call.
     * @param {string} alias - The alias of the property to favorite
     * @param {()=>{}=} callback - Optional callback function after API 
     * response.
     */
    $scope.addPropertyToFavoriteViaApi = function(alias, callback) {
        // uncomment when API is created.
        /*$http.get('/umbraco/api/favoriteContent/addPropertyToFavorites?property=' + alias).then(function(response) {
            if (callback) {
                callback();
            }
        });*/
    };

    /**
     * Adds favorite buttons to all property editors for use in add/remove 
     * favorites.
     */
    $scope.addFavoriteButtons = function() {
        var clonedContent = editorState.getCurrent();
        clonedContent.properties.forEach(function(property) {
            var buttonClass = 'orc-fav fav-button' + ($scope.isPropFavorite(property.alias) ? ' orc-fav-favorited': '') + ' alias--' + property.alias + '--';
            var buttonHtml = '<a class="' + buttonClass + '"><i class="icon-favorite" style="font-size: 1em"></i></a><span> </span>';
            property.description = buttonHtml + (property.description ? property.description : '');
        });
        clonedContent.tabs.forEach(function(tab) {
            tab.properties.forEach(function(property) {
                var buttonClass = 'orc-fav fav-button' + ($scope.isPropFavorite(property.alias) ? ' orc-fav-favorited': '') + ' alias--' + property.alias + '--';
                var buttonHtml = '<a class="' + buttonClass + '"><i class="icon-favorite" style="font-size: 1em"></i></a><span> </span>';                
                property.description = buttonHtml + (property.description ? property.description : '');
            });
        });
        contentEditingHelper.reBindChangedProperties(editorState.getCurrent(), clonedContent);
    };

    /**
     * Makes an API call to a custom endpoint to get a list of favorited 
     * properties.
     * @param {()=>{}} callback - Triggered after the API call is completed.
     */
    $scope.getFavoritedPropertiesFromApi = function(callback) {
        // uncomment when API is created.
        /*$http.get('/umbraco/api/favoriteContent/getFavoritedProperties').then(function(response) {
            $scope.favoritedProperties = response; // an array of strings
            if (callback) {
                callback();
            }
        });*/
        // delete following mock behavior.
        $scope.favoritedProperties = ['excerpt'];
        callback();
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
            if (prop === alias) {
                isPropFavorite = true;
            }
        });
        return isPropFavorite;
    };

    $scope.removePropertyFromFavoritesViaApi = function(alias, callback) {
        // uncomment when API is created.
        /*$http.get('/umbraco/api/favoriteContent/removePropertyFromFavorites?property=' + alias).then(function(response) {
            if (callback) {
                callback();
            }
        });*/
    };

    /**
     * Iterates through `$scope.favoritedProperties` and updates `$scope.properties`
     * with the values of the matching content node properties.
     * @returns {void} void
     */
    $scope.syncAllPropertiesToFavoriteContent = function() {
        var props = contentEditingHelper.getAllProps(editorState.getCurrent());
        $scope.favoritedProperties.forEach(function(alias) {
            props.forEach(function(property) {
                if (property.alias === alias) {
                    // Tags behavior fix.
                    if (property.editor === 'Umbraco.Tags' && property.config.storageType === 'Csv') {
                        property.config.storageType = 'Json';
                    }
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
        var alias = $scope.favoritedProperties[index];
        var clonedContent = editorState.getCurrent();
        clonedContent.properties.forEach(function(property) {
            if (property.alias === alias) {
                property.value = $scope.properties[index].value;
            }
        });
        clonedContent.tabs.forEach(function(tab) {
            tab.properties.forEach(function(property) {
                if (property.alias === alias) {
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
            $scope.favoritedProperties.splice($scope.favoritedProperties.indexOf(alias), 1);
            $scope.addPropertyToFavoriteViaApi(alias);
        } else {
            $scope.favoritedProperties.push(alias);
            $scope.removePropertyFromFavoritesViaApi(alias);
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

	// Call $scope.init() //////////////////////////////////////////////////////

    $scope.init();

});
