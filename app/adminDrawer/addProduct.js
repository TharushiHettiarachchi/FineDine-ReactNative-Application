import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  Switch,
  Modal,
  FlatList,
  TouchableOpacity,
  Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { db } from '../../firebaseConfig';
import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';

import InputGroups from '../../components/InputGroups';
import ButtonGroups from '../../components/ButtonGroup';

export default function AddProduct() {
  const [image, setImage] = useState(null);
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [fullPortionPrice, setFullPortionPrice] = useState('');
  const [halfPortionPrice, setHalfPortionPrice] = useState('');
  const [description, setDescription] = useState('');
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categorySnapshot = await getDocs(collection(db, "category"));
        const categoryList = categorySnapshot.docs.map(doc => doc.data().name);
        setCategories(categoryList);
      } catch (error) {
        console.error("Error fetching categories: ", error);
      }
    };

    fetchCategories();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

const handleAddProduct = async () => {
  if (!productName || !category || !fullPortionPrice || !halfPortionPrice || !description) {
    alert('Please fill all required fields.');
    return;
  }

  try {
    let imageUrl = '';

    if (image) {
      const data = new FormData();
      data.append('file', {
        uri: image,
        type: 'image/jpeg',
        name: 'upload.jpg',
      });
      data.append('upload_preset', 'ml_default');

      const res = await fetch('https://api.cloudinary.com/v1_1/dtguoyfdp/image/upload', {
        method: 'POST',
        body: data,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });

      const file = await res.json();

      if (!res.ok) {
        throw new Error(file.error?.message || 'Image upload failed');
      }

      imageUrl = file.secure_url;
    }

    const productData = {
      name: productName,
      category,
      fullPortionPrice: parseFloat(fullPortionPrice),
      halfPortionPrice: parseFloat(halfPortionPrice),
      description,
      isVegetarian,
      imageUrl,
      createdAt: Timestamp.now(),
    };

    await addDoc(collection(db, 'foods'), productData);

    Alert.alert('Success', 'Product added successfully!');
    setProductName('');
    setCategory('');
    setFullPortionPrice('');
    setHalfPortionPrice('');
    setDescription('');
    setImage(null);
    setIsVegetarian(false);
  } catch (error) {
    console.error('Error adding product: ', error);
    Alert.alert('Error', `Failed to add product: ${error.message}`);
  }
};


  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Pressable onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <View style={styles.placeholder}>
              <Text style={{ color: '#888' }}>Add</Text>
            </View>
          )}
        </Pressable>

        <View style={styles.inputgroupsView1}>
          <InputGroups
            Label="Product Name"
            inputValue={productName}
            functionToDo={setProductName}
            placeholder="Enter product name"
          />

          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Category</Text>
            <Pressable
              style={styles.customPicker}
              onPress={() => setShowCategoryModal(true)}
            >
              <Text>{category || 'Select a category'}</Text>
            </Pressable>
          </View>

          <InputGroups
            Label="Full Portion Price"
            inputValue={fullPortionPrice}
            functionToDo={setFullPortionPrice}
            placeholder="Enter full price"
            keyboardType="numeric"
          />

          <InputGroups
            Label="Half Portion Price"
            inputValue={halfPortionPrice}
            functionToDo={setHalfPortionPrice}
            placeholder="Enter half price"
            keyboardType="numeric"
          />

          <InputGroups
            Label="Description"
            inputValue={description}
            functionToDo={setDescription}
            placeholder="Write a description"
            multiline
          />

          <View style={styles.checkboxContainer}>
            <Text style={styles.checkboxLabel}>Is Vegetarian?</Text>
            <Switch
              value={isVegetarian}
              onValueChange={setIsVegetarian}
              thumbColor={isVegetarian ? '#FFB22C' : '#f4f3f4'}
              trackColor={{ false: '#ccc', true: '#ffd984' }}
            />
          </View>
        </View>

        <ButtonGroups Label={"Add Product"} functionToDo={handleAddProduct} />
      </View>

      <Modal visible={showCategoryModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Category</Text>
            <FlatList
              data={categories}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setCategory(item);
                    setShowCategoryModal(false);
                  }}
                  style={styles.modalItem}
                >
                  <Text style={{ fontSize: 16 }}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  image: {
    marginBottom: 10,
    width: 120,
    height: 120,
    borderRadius: 90,
  },
  placeholder: {
    width: 120,
    height: 120,
    borderRadius: 90,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  inputgroupsView1: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerContainer: {
    width: '90%',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  pickerLabel: {
    fontSize: 14,
    alignSelf: 'center',
    color: '#000',
    fontWeight: 'bold',
  },
  customPicker: {
    borderColor: '#000',
    borderWidth: 1,
    marginTop: 5,
    height: 40,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 0,
    paddingStart: 20,
    justifyContent: 'center',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '80%',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    maxHeight: '40%',
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
  },
  modalItem: {
    paddingVertical: 10,
  },
});
